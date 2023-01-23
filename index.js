require('dotenv').config() // dotenv import
const { default: axios } = require('axios');
const { response } = require('express');
const express = require('express')
const bodyParser = require('body-parser')
const qs = require('qs');

const Bearer = require('./Bearer')
const OTP = require('./GenerateOtp');
const { SingleMessage } = require('./SMS');

// express configure
const app = express()
app.use(bodyParser.json())


app.get('/', function (req, res) {
    res.send('Hello World')
})
app.get('/otp', (req, res) => {
    const mobileNumber = req.body.mobile;
    const otpNumber = OTP.otp();
    const param = qs.stringify(SingleMessage("আপনার OTP নাম্বার " + otpNumber,mobileNumber));
    axios.post(process.env.SMS_API_URL, param)
        .then(response => {
            console.log("status ",response.status)
            console.log("data",response.data)
        })
        .catch(error => {
            console.log(error)
        })
    res.json(otpNumber)
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