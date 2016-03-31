var express = require('express');
var router = express.Router();

var Bird = require('../models/bird.js');

/* GET home page. */
router.get('/', function(req, res, next) {

	// ask schema to find all bird documents and provide the results to the callback.
	Bird.find(function(err, birdDocs) {
		if (err) { return next(err); }
		return res.render('index', { birds: birdDocs, error: req.flash('error') });  // returns array of birds holding JSON objects of class Bird.
	});
});

router.get('/editbird', function(req, res, next) {
	// this is the bird we care about
	var birdName = req.query.bName;
	var query = { 'name' : birdName };
	Bird.findOne( query, function(err, thisBird) {
		if (err) { return next(err); }
		// TODO set undefined values to empty string
		return res.render('editbird',{ bird: thisBird });
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

/*
 * delete a bird via POST
 */
router.post('/deleteBird',function(req, res, next) {
	var birdName = req.body.name;
	var myAct = req.body.selectedAction;
	console.log(myAct);
	// make sure there's a bird to work with and an action to take
	if (!birdName || myAct == "") {
		res.redirect('/',{error: birdName + " not found!"})
	}

	// OK, no errors? try performing the requested action!
	var query = { 'name' : birdName };
	// console.log("query string is: " + query);

	if (myAct === "delete") {
		Bird.remove( query, function(err) {
			if (err) {
				return next(new Error('Unable to delete bird named: ' + req.body.name));
			}
			res.redirect('/');
		});
	}
	else if (myAct === "edit")
	{
		// redirect to an edit screen - pass bird's name along as a query parameter so 
		// we can tease its data out from the db
		res.redirect('/editbird/?bName=' + birdName);
	} 

});

/*
 * update bird via POST
 */
router.post('/updateBird',function(req, res, next) {
	// update the bird data based on form data
	console.log(req.body.originalName);
	// TODO update the record

	// redirect back to homepage.
	res.redirect('/');
});

module.exports = router;
