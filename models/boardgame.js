const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BoardGameSchema = new Schema({
	title: { type: String, required: true },
	release_year: {
		type: Number,
		minlength: 4,
		maxlength: 4,
		default: 1950,
	},
	designers: [{ type: Schema.Types.ObjectId, ref: 'Designer' }],
	publishers: [{ type: Schema.Types.ObjectId, ref: 'Publisher' }],
	description: {
		short: { type: String, maxlength: 100 },
		full: { type: String },
	},
	number_of_players: {
		min: { type: Number, min: 0, default: 0 },
		max: { type: Number, min: 0, default: 0 },
	},
	playing_time: {
		min: { type: Number, min: 0, default: 0 },
		max: { type: Number, min: 0, default: 0 },
	},
	weight: {
		type: Number,
		min: 0,
		max: 5,
		default: 0,
	},
	categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
});

BoardGameSchema.virtual('url').get(function () {
	return `/boardgame/${this._id}`;
});

module.exports = mongoose.model('Boardgame', BoardGameSchema);
