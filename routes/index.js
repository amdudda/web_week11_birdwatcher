var express = require('express');
var router = express.Router();

var Bird = require('../models/bird.js');

/* GET home page. */
router.get('/', function(req, res, next) {

	// ask schemi to find all bird documents and provide the results to the callback.
	Bird.find(function(err, birdDocs) {
		if (err) { return next(err); }
		return res.render('index', { birds: birdDocs, error: req.flash('error') });  // returns array of birds holding JSON objects of class Bird.
	});
});

/* POST data */
router.post('/',function(req, res, next) {

	for (var att in req.body) {
		if (req.body[att] === '') {
			delete(req.body[att]);
		}
	}

	console.log(req.body.dateSeen);
	var date = req.body.dateSeen || date.now();
	
	req.body.datesSeen = [];
	req.body.datesSeen.push(date)

	// build nested Nest data
	req.body.nestData = {
		'location' : req.body.location,
		'materials' : req.body.materials
	};

	//create new Bird object and send it to db
	var newSighting = Bird(req.body);

	// save it in the database
	newSighting.save(function(err){
		if (err) {
			if (err.name == "ValidationError") {
				req.flash('error','Invalid data.  Please re-enter.');
				return res.redirect('/');
			}
			if (err.code == 11000) {
				req.flash('error','A bird with that name already exists!');
				return res.redirect('/');
			}
			else return next(err);  // some other error happened we haven't foreseen
		}
		res.status(201);  // 201 = created
		return res.redirect('/');
	});
});

/*
 * POST latest sighting date
 */
router.post('/addDate',function(req, res, next) {
	// check that user provided a date
	var newSighting = req.body.dateSeen;
	if (!newSighting || newSighting == '') {
		// TODO pass error message to user
		// req.flash('error','No new date entered, unable to update sighting dates.');
		res.redirect('/');
	}

	// find the bird with this name and add the new date to the array of dates
	Bird.findOne( {name: req.body.name }, function(err, bird){
		if (err) { return next(err); }
		if (!bird) { return next(new Error('No bird found with name ' + req.body.name)); }

		// yay, no errors, let's append the new date and save it
		bird.datesSeen.push(newSighting);
		
		bird.save(function(err){
			if (err) { return next(err); }
			res.redirect('/');
		});
	});
});

module.exports = router;
