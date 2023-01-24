require('dotenv').config() // dotenv import
const { default: axios } = require('axios');
const { response } = require('express');
const express = require('express')
const bodyParser = require('body-parser')
const qs = require('qs');
const NodeCache = require("node-cache");
const myCache = new NodeCache();

const Bearer = require('./Bearer')
const OTP = require('./GenerateOtp');
const { SingleMessage } = require('./SMS');

// express configure
const app = express()
app.use(bodyParser.json())


app.get('/', function (req, res) {
    res.send('Hello World')
})
app.get('/cache', (req, res) => {
    const { mobile } = req.body.mobile;
    console.log(mobile)
    if (!mobile) {
        return res.json({ message: 'provide a mobile number' })
    }
    console.log('before', myCache.get(mobile))
    if (!myCache.get(mobile)) {
        console.log('set')
        myCache.set(mobile, mobile, 60);
    }
    console.log('after', myCache.get(mob))
    console.log(myCache.getTtl(mob))
    res.json({ ok: 'ok' })
})
app.post('/otp', (req, res) => {
    /*
    check if user already registered or not.
    if yes return with message
    if not then follow procedure 
    */
    const { mobile } = req.body;
    const otpNumber = OTP.otp();
    const param = qs.stringify(SingleMessage("আপনার OTP নাম্বার " + otpNumber, mobile));
    
    // if prameter not exist
    if (!mobile) {
        return res.json({
            status: 'failed',
            message: 'please provide a mobile number'
        })
    }
    // first check if mobile number exist
    if (myCache.get(mobile)) {
        return res.json({
            status: 'unseccussful',
            message: 'wait for otp',
            time: new Date(myCache.getTtl(mobile)).toString()
        })
    }
    // if not then set & send & store in db this message info
    axios.post(process.env.SMS_API_URL, param)
        .then(response => {
            console.log(response.data)
            if (response.data.error_code === 0) {
                myCache.set(mobile, mobile, 60);
                return res.json({
                    status: 'success',
                    message: 'otp is being sent'
                })
            }
        })
        .catch(error => {
            return res.json({
                status: 'failed',
                message: 'error happens'
            })
        })
})

app.get('/balance', function (req, res) {
    const param = {
        email: process.env.SMS_API_USER,
        password: process.env.SMS_API_PASSWORD,
        method: process.env.SMS_API_GET_BALANCE
    }
    axios.post(process.env.SMS_API_URL, qs.stringify(param))
        .then(response => {
            res.json(response.data)
        })
        .catch(error => {
            res.json({ status: 'error', message: 'Error happens' })
        })
})

app.post('/get_token', (req, res) => {
    res.json(process.env.API_SYNC_TOKEN)
})

app.listen(4000)