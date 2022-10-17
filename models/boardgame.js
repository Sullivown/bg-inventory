const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BoardGameSchema = new Schema({
	title: { type: String, required: true },
	release_year: { type: Date },
	designers: [
		{ type: Schema.Types.ObjectId, ref: 'Designer', required: true },
	],
	publishers: [{ type: Schema.Types.ObjectId, ref: 'Publisher' }],
	description: {
		short: { type: String, maxlength: 100 },
		full: { type: String },
	},
	number_of_players: {
		min: { type: Number, min: 0 },
		max: { type: Number, min: 0 },
	},
	playing_time: {
		min: { type: Number, min: 0 },
		max: { type: Number, min: 0 },
	},
	weight: {
		type: Number,
		min: 0,
		max: 5,
	},
	categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
});

BoardGameSchema.virtual('url').get(function () {
	return `/boardgame/${this._id}`;
});

module.exports = mongoose.model('Boardgame', BoardGameSchema);