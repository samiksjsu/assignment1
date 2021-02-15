const express = require('express')
const port = process.env.PORT || 4000
const userrouter = require('./router/userrouter')
const adminrouter = require('./router/adminrouter')
const bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')

    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).send()
    }
    
    next()
})
app.use(express.json())
app.use(userrouter)
app.use(adminrouter)

app.listen(port, () => {
    console.log('Server is running at port ', port)
})