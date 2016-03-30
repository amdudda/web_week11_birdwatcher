var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/*
 * A birdwatcher database.  Records
 * types of birds, date spotted, and other info.
 */

var birdSchema = new Schema({
	name : { type :String,
		required: true,
		unique: true,
		lowercase : true 			// this just converts data to lowercase
		},
	description : String,
	averageEggsLaid : { type: Number, min: 1, max: 50	},	// accepts both int and floats
	threatened : { type: Boolean, default: false },			// is bird threatened with extinction?
	nestData: { location: String, materials: String },  	// nested data about nests, natch ;-)
	datesSeen : [ { type: Date, default: Date.now } ] 		// last spotted in the wild
});

var Bird = mongoose.model('Bird', birdSchema);

module.exports = Bird;