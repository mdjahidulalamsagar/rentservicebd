require('dotenv').config() // dotenv import
const { default: axios } = require('axios');
const { response } = require('express');
const express = require('express')
const qs = require('qs');


// express configure
const app = express()


app.get('/', function (req, res) {
    res.send('Hello World')
})

app.get('/balance', function (req, res) {
    const param = {
        email: process.env.SMS_API_USER,
        password: process.env.SMS_API_PASSWORD,
        method: process.env.SMS_API_GET_BALANCE
    }
    axios.post(process.env.SMS_API_URL,qs.stringify(param))
        .then(response => {
            res.json(response.data)
        })
        .catch(error => {
            res.json(error)
        }) 
})

app.listen(4000)