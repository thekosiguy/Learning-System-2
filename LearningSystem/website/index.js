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
var flash=require("connect-flash");

app.use(flash());
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

app.get('/', (req, res) => {
	res.render('menu', {message: req.flash('message')});
})

app.get('/user', (req, res) => {
	var username = app.get('username'); 
	const user = {user: username}
	res.render('user', user)
});

app.post('/', passport.authenticate
	('local', {
	successRedirect: '/user',
	failureRedirect: '/'
})); 

app.get('/register', (req, res) => {
	var readline = require('readline');
	var fs = require('fs');
	res.render('register')
})

app.post('/processors', (req, res) => {
	const formData = JSON.stringify(req.body, null, 2)
	const jsonObj = JSON.parse(formData)
	console.log(jsonObj.username)

	const sqlite3 = require('sqlite3').verbose(); 
	
	let usersdb = new sqlite3.Database('./users.db', (err) => {
	if (err){
		return console.error(err.message); 
	}
		console.log('Connected to Users database.');
	})

    let sql = usersdb.run('UPDATE Users SET processors=? WHERE username=?',["done", jsonObj.username], (err) => {
		if(err) {
			return console.log(err.message); 
		}
			console.log('The Users table was updated.');
			

		})	

	res.render('processors')
})

app.post('/moderndev', (req, res) => {
	const formData = JSON.stringify(req.body, null, 2)
	const jsonObj = JSON.parse(formData)
	console.log(jsonObj.username)

	const sqlite3 = require('sqlite3').verbose(); 
	
	let usersdb = new sqlite3.Database('./users.db', (err) => {
	if (err){
		return console.error(err.message); 
	}
		console.log('Connected to Users database.');
	})

    let sql = usersdb.run('UPDATE Users SET moderndev=? WHERE username=?',["done", jsonObj.username], (err) => {
		if(err) {
			return console.log(err.message); 
		}
			console.log('The Users table was updated.');

		})	

	res.render('moderndev')
})

app.post('/quiz', (req, res) => {
	const formData = JSON.stringify(req.body, null, 2)
	const jsonObj = JSON.parse(formData)
	console.log(jsonObj.username)

	const sqlite3 = require('sqlite3').verbose(); 
	
	let usersdb = new sqlite3.Database('./users.db', (err) => {
	if (err){
		return console.error(err.message); 
	}
		console.log('Connected to Users database.');
	})

    let sql = usersdb.run('UPDATE Users SET quizzes=? WHERE username=?',["done", jsonObj.username], (err) => {
		if(err) {
			return console.log(err.message); 
		}
			console.log('The Users table was updated.');

		})	

	res.render('quiz')
})

app.post('/register', (req, res) => {
	const formData = JSON.stringify(req.body, null, 2)
	const jsonObj = JSON.parse(formData)
	
	const sqlite3 = require('sqlite3').verbose(); 
	
	let usersdb = new sqlite3.Database('./users.db', (err) => {
	if (err){
		return console.error(err.message); 
	}
		console.log('Connected to Users database.');
	})
															  
	let sql = usersdb.run('INSERT INTO Users(name, house_no, street, city, postcode, gender, dob, emailadd, username, password) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
	[jsonObj.name, jsonObj.house_no, jsonObj.street, jsonObj.city, jsonObj.postcode, 
	jsonObj.gender, jsonObj.dob, jsonObj.emailadd, jsonObj.username, jsonObj.password], (err) => {
		if(err) {
			return console.log(err.message); 
		}
		console.log('The Users table has been updated.');
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

app.get('/guest', (req, res) => {
	res.render('guest')
})

app.get('/processors', (req, res) => {
	res.render('processors')
})

app.get('/moderndev', (req, res) => {
	res.render('moderndev')
})

app.get('/quiz', (req, res) => {
	res.render('quiz')
})

app.get('/progress', (req, res) => {
	var results = app.get('results'); 
	const data = {processors: results.processors,
								moderndev: results.moderndev,
								quizzes: results.quizzes}
	res.render('progress', data)
})

app.get('/about', (req, res) => {
	res.render('about')
})

//Used for validating login information input by the user
passport.use(new LocalStrategy({passReqToCallback : true},
	function(req, username, password, done) {
		const sqlite3 = require('sqlite3').verbose(); 
		const usersdb = new sqlite3.Database('./users.db'); 

		usersdb.get('SELECT password FROM Users WHERE username = ?', [username],
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
						//Extract the user's progress data from the database
						usersdb.get('SELECT processors, moderndev, quizzes FROM Users WHERE username = ?', [username],
							function(err, results, fields){
								if (err) {done(err)}; 
								console.log(results);
								app.set('results', results); 								
							}
						)
					
						//log the user in and store his/her username
						app.post('/user', (req, res) => {
							res.send('username', username)
						})
						app.set('username', username); 
						return done(null, {username}); 
					}else{
						//Incorrect password therefore return to menu page
						return done(null, false, req.flash('message', 'Invalid Password!'));
					}
				//Username doesn't exist in the database therefore return to menu page
				}else{
					  done(null, false, req.flash('message', 'Invalid Username!'))
				}
		})
	}
)); 

app.listen(port, () => console.log(`app listening on port ${port}`));