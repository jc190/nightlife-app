'use strict';

var path = process.cwd();
var http = require('https');

var GoingHandler = require('../controllers/goingHandler.server.js');
var goingHandler = new GoingHandler(); 

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/auth/github');
		}
	}

	function isLoggedInAjax (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.json({ redirect: '/auth/github' });
		}
	}

	app.route('/')
		.get(function (req, res) {
			res.render('index', {user: req.user});
		});

	app.route('/login')
		.get(function (req, res) {
			res.redirect('/auth/github');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/results')
		.get(function (req, res) {
			var path1 = '/v3/businesses/search?location='+ req.query.q +'&categories=bars';
			path1 = encodeURI(path1);
			var options = {
				hostname: 'api.yelp.com',
				path: path1,
				headers: {
					'Authorization': 'Bearer ' + process.env.YELP_TOKEN
				}
			}
			http.get(options, function(data) {
				let rawData = '';
				data.setEncoding('utf8');
				data.on('data', function(chunk) {rawData += chunk});
				data.on('end', function() {
					try {
						const parsedData = JSON.parse(rawData);
						const mappedData = parsedData.businesses.map(function(business) {
							return {
								id: business.id,
								name: business.name,
								image_url: business.image_url,
								category: business.categories[0].title,
								address: business.location.display_address
							}
						})
						res.render('results', {user: req.user, data: mappedData});
					} catch (error) {
						console.log(error.message);
					}
				});
			});
		});

	app.route('/business/:id/going')
		.get(goingHandler.getNumGoing)
		.post(isLoggedInAjax, goingHandler.addToGoing);

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			failureRedirect: '/'
		}), function (req, res) {
			res.redirect(req.headers.referer);
		});
};
