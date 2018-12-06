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

app.get('/webpage2', (req, res) => {
	var readline = require('readline');
	var fs = require('fs');
	res.render('webpage2'); 
})

app.post('/webpage2', (req, res) => {
	const formData = JSON.stringify(req.body, null, 2)
	const jsonObj = JSON.parse(formData)

	const details = {
		title: jsonObj.title, 
		items: [],
		email: jsonObj.email,
		contact_no: jsonObj.contact_no
	}

	for (var i = 0; i < jsonObj.no_of_items; i++){
		details.items.push({item: ""}); 
	}

	app.set('details', details); 
	res.render('items', details);  
})

app.post('/items', (req, res) => {
	var details = app.get('details');
	const formData = JSON.stringify(req.body, null, 2)
	const itemData = JSON.parse(formData)

	var item_data = []; 
	var index  = 0;
	var num_of_items;

	if (typeof itemData.name_of_item === "string"){
		num_of_items = itemData.name_of_item.split().length; 
	}else{
		num_of_items = itemData.name_of_item.length; 
	}

	if ((num_of_items) > 1){
		for (var i = 0; i < num_of_items; i ++){
			item_data.push([]); 
			(item_data[index]).push("Item Name: "+itemData.name_of_item[i]); 
			(item_data[index]).push(" Description: "+itemData.desc_of_item[i]); 
			(item_data[index]).push(" Price: "+itemData.price[i]);
			index += 1; 
		}
	}else{
		item_data.push("Item Name: "+itemData.name_of_item);
		item_data.push(" Description: "+itemData.desc_of_item); 
		item_data.push(" Price: "+itemData.price);
	}
	

	console.log(item_data); 

	const user_input = {
		title: details.title,
		item_data: item_data, 
		email: details.email,
		contact_no: details.contact_no
	}

	res.render('displayWebpage', user_input); 

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