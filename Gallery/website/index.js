#!/usr/bin/env node
const express = require('express')

const handlebars = require('express-handlebars').create({defaultLayout: 'main'})
const bodyParser = require('body-parser')
const app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

const port = 8080

app.get('/', (req, res) => {
	res.render('menu')
})
app.get('/register', (req, res) => {
	var readline = require('readline');
	var fs = require('fs');
	res.render('register'); 
})

app.get('/webpage', (req, res) => {
	var readline = require('readline');
	var fs = require('fs');
	res.render('webpage');  
})

app.post('/register', (req, res) => {
	const formData = JSON.stringify(req.body, null, 2)
	const jsonObj = JSON.parse(formData)
	
	const sqlite3 = require('sqlite3').verbose(); 
	
	let userdb = new sqlite3.Database('./users.db', (err) => {;
	if (err){
		return console.error(err.message); 
	}
		console.log('Connected to User database.');
	})
															  
	let sql = userdb.run('INSERT INTO Users(name, house_no, street, city, postcode, gender, dob, emailadd, username, password) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
	[jsonObj.name, jsonObj.house_no, jsonObj.street, jsonObj.city, jsonObj.postcode, 
	jsonObj.gender, jsonObj.dob, jsonObj.emailadd, jsonObj.username, jsonObj.password], (err) => {
		if(err) {
			return console.log(err.message); 
		}
		console.log('Data was added to the table.');
	})
															  	
	const users_details = {
		name: jsonObj.name,
		house_no: jsonObj.house_no,
		street: jsonObj.street,
		city: jsonObj.city,
		postcode: jsonObj.postcode,
		gender: jsonObj.gender,
		dob: jsonObj.dob,
		emailadd: jsonObj.emailadd,
		username: jsonObj.username,
  		password: jsonObj.password
	}
	
	res.render('datapage', users_details)
})

app.get('/webpage', (req, res) => {
	res.render('webpage')
})

app.listen(port, () => console.log(`app listening on port ${port}`))