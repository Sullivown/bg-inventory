const Designer = require('../models/designer');
const Boardgame = require('../models/boardgame');

const async = require('async');
const { body, validationResult } = require('express-validator');

exports.designer_list = function (req, res, next) {
	Designer.find()
		.sort([['name', 'ascending']])
		.exec(function (err, list_designers) {
			if (err) {
				return next(err);
			}
			res.render('designer_list', {
				title: 'Designers',
				designer_list: list_designers,
			});
		});
};

exports.designer_detail = function (req, res, next) {
	async.parallel(
		{
			designer(callback) {
				Designer.findById(req.params.id).exec(callback);
			},
			designers_boardgames(callback) {
				Boardgame.find({ designers: req.params.id }, 'title').exec(
					callback
				);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.designer == null) {
				const err = new Error('Designer not found');
				err.status = 404;
				return next(err);
			}

			res.render('designer_detail', {
				title: 'Designer Detail',
				designer: results.designer,
				designer_boardgames: results.designers_boardgames,
			});
		}
	);
};

exports.designer_create_get = function (req, res, next) {
	res.render('designer_form', { title: 'Create Designer' });
};

exports.designer_create_post = [
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('You must enter a name.'),
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('designer_form', {
				title: 'Create Designer',
				author: req.body,
				errors: errors.array(),
			});
			return;
		}
		res.render('designer_form', { title: 'Create Designer' });
	},
];
