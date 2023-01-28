require('dotenv').config() // dotenv import
const { default: axios } = require('axios');
const { response } = require('express');
const express = require('express')
const bodyParser = require('body-parser')
const qs = require('qs');
const NodeCache = require("node-cache");
const myCache = new NodeCache();

// express configure
const app = express()
app.use(bodyParser.json())

// message api constants
const SMS_API_URL = 'https://smsapi.shiramsystem.com/user_api/'
const SMS_API_USER = 'shohunabir@gmail.com'
const SMS_API_PASSWORD = '4cb21e1e85c5353b48347d7bf213f432'
const SMS_API_MASK = 'RentService'
const SMS_API_GET_BALANCE = 'get_balance'
const SMS_API_SEND_SMS = 'send_sms'


// otp function
const otp = () => (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

// root url always for testing
app.get('/', function (req, res) {
    res.send('Hello World')
})

app.post('/otp', (req, res) => {
    const { mobile } = req.body;
    const otpNumber = otp();
    const params = {
        email: SMS_API_USER,
        password: SMS_API_PASSWORD,
        method: SMS_API_SEND_SMS,
        mobile: [mobile],
        mask: SMS_API_MASK,
        message: "আপনার OTP নাম্বার " + otpNumber
    }

    // if prameter not exist
    if (!mobile) {
        return res.json({
            status: 'failed',
            message: 'please provide a mobile number'
        })
    }
    // if already sent otp then return
    if (myCache.get(mobile)) {
        return res.json({
            status: 'unsuccess',
            message: 'already sent, wait for otp',
            time: new Date(myCache.getTtl(mobile)).toString()
        })
    }
    // if not then set & send & store in db this message info
    axios.post(process.env.SMS_API_URL, qs.stringify(params))
        .then(response => {
            console.log(response.data)
            if (response.data.error_code === 0) {
                myCache.set(mobile, otpNumber, 60);
                return res.json({
                    status: 'success',
                    message: 'otp is being sent',
                    additional: response.data
                })
            } else return res.json({
                status: 'fail',
                message: 'errors happen! try again later',
                additional: response.data
            })
        })
        .catch(error => {
            return res.json({
                status: 'failed',
                message: 'error happens'
            })
        })
})
// registration
app.post('/registration', (req, res) => {
    const { name, mobile, password, otp } = req.body;
    console.log(name,mobile,password,otp,req.body)
    // check if already user exist - todo
    // check if otp match
    const value = myCache.get(mobile);
    console.log(value)
    if (value === undefined) {
        // if already expired then return 
        return res.json({
            status: 'failed',
            message: 'otp not found'
        })
    }
    if (value !== otp) {
        // if otp not matched
        return res.json({
            status: 'unsuccess',
            message: "otp dosen't match"
        })
    }
    // finally register
    return res.json({
        status: 'success',
        message: 'registration successful, please login'
    })
})
app.get('/balance', function (req, res) {
    const param = {
        email: SMS_API_USER,
        password: SMS_API_PASSWORD,
        method: SMS_API_GET_BALANCE
    }
    axios.post(SMS_API_URL, qs.stringify(param))
        .then(response => {
            return res.json(response.data)
        })
        .catch(error => {
            return res.json({ status: 'error', message: 'Error happens' })
        })
})


app.listen(4000)