const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BoardGameInstanceSchema = new Schema({
	boardgame: {
		type: Schema.Types.ObjectId,
		ref: 'Boardgame',
		required: true,
	},
	status: {
		type: String,
		required: true,
		enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
		default: 'Maintenance',
	},
	created: { type: Date, default: Date.now },
	due_back: { type: Date, default: Date.now },
});

BoardGameInstanceSchema.virtual('url').get(function () {
	return `/boardgameinstance/${this._id}`;
});

module.exports = mongoose.model('BoardgameInstance', BoardGameInstanceSchema);
