const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DesignerSchema = new Schema({
	name: { Type: String, required: true },
});

DesignerSchema.virtual('url').get(function () {
	return `/designer/${this._id}`;
});

module.exports = mongoose.model('Designer', DesignerSchema);
