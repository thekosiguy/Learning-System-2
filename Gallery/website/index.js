#!/usr/bin/env node
const express = require('express')

const handlebars = require('express-handlebars').create({defaultLayout: 'main'})
const bodyParser = require('body-parser')
const app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

//Initialize authentication packages required for passport
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

app.use(require('serve-static')(__dirname + '/../../public'));
app.use(require('express-session')({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
  }));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});

app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

const port = 8080

app.get('/menu', (req, res) => {
	res.render('menu')
})

app.get('/user', (req, res) => {
	res.render('user')
});

app.post('/menu', passport.authenticate
	('local', {
	successRedirect: ('/user'),
	failureRedirect: '/menu'
})); 

app.get('/register', (req, res) => {
	var readline = require('readline');
	var fs = require('fs');
	res.render('register'); 
})

app.post('/register', (req, res) => {
	const formData = JSON.stringify(req.body, null, 2)
	const jsonObj = JSON.parse(formData)
	
	const sqlite3 = require('sqlite3').verbose(); 
	
	let userdb = new sqlite3.Database('./users.db', (err) => {
	if (err){
		return console.error(err.message); 
	}
		console.log('Connected to Users database.');
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
	var readline = require('readline');
	var fs = require('fs');
	res.render('webpage');  
})

app.post('/webpage', (req, res) => {
	res.render('webpage')
})

app.get('/about', (req, res) => {
	res.render('about')
})

//Used for validating login information input by the user
passport.use(new LocalStrategy(
	function(username, password, done) {
		console.log("Username:"+ username);
		console.log("Password:" + password);

		const sqlite3 = require('sqlite3').verbose(); 
		const userdb = new sqlite3.Database('./users.db'); 

		userdb.get('SELECT password FROM Users WHERE username = ?', [username],
			function(err, results, fields){
				if (err) {done(err)}; 
				
				if (results != undefined){
					//Length of returned object is 0 therefore return to menu page
					if (results.length === 0){
						done(null, false)
					}
					/*Username exists in the database, so compare password input by the user
					to password stored in the database that corresponds to the username, if
					they match log the user in.*/
					if (results.password === password){
						//log the user in
						return done(null, {username}); 
					}else{
						//Incorrect password therefore return to menu page
						return done(null, false)
					}
				//Username doesn't exist in the database therefore return to menu page
				}else{
					done(null, false)
				}
			})
	}
));

app.listen(port, () => console.log(`app listening on port ${port}`))