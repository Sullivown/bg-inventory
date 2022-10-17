const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PublisherSchema = new Schema({
	name: { Type: String, required: true },
	website: { Type: String },
});

PublisherSchema.virtual('url').get(function () {
	return `/publisher/${this._id}`;
});

module.exports = mongoose.model('Publisher', PublisherSchema);
