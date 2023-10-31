'use strict';
const express = require('express')
const app = express();

const path = require('path');
app.use(express.static(path.join(__dirname, '/pub')))

app.get('/', (req, res) => {
	res.redirect('/examples.html')
})

app.get('/docs', (req, res) => {
	res.redirect('/documentation.html')
})

const port = process.env.PORT || 5000
app.listen(port, () => {
	console.log(`Listening on port ${port}...`)
})  
