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
				designer: req.body,
				errors: errors.array(),
			});
			return;
		}
		// Data from form is valid.
		// Create a Designer object with escaped and trimmed data.
		const designer = new Designer({
			name: req.body.name,
		});
		designer.save((err) => {
			if (err) {
				return next(err);
			}
			// Successful - redirect to new designer record.
			res.redirect(designer.url);
		});
	},
];

exports.designer_update_get = function (req, res, next) {
	Designer.findById(req.params.id).exec(function (err, designer) {
		if (err) {
			return next(err);
		}
		res.render('designer_form', {
			title: 'Update Designer',
			designer: designer,
		});
	});
};

exports.designer_update_post = [
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('You must enter a name.'),
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a Designer object with escaped and trimmed data.
		const designer = new Designer({
			name: req.body.name,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('designer_form', {
				title: 'Update Designer',
				designer,
				errors: errors.array(),
			});
			return;
		}
		// Data from form is valid.

		Designer.findByIdAndUpdate(
			req.params.id,
			designer,
			(err, thedesigner) => {
				if (err) {
					return next(err);
				}

				// Successful: redirect to designer detail page.
				res.redirect(thedesigner.url);
			}
		);
	},
];

exports.designer_delete_get = function (req, res, next) {
	async.parallel(
		{
			designer(callback) {
				Designer.findById(req.params.id).exec(callback);
			},
			designers_boardgames(callback) {
				Boardgame.find({ designers: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.designer == null) {
				res.redirect('/designer');
			}
			res.render('designer_delete', {
				title: 'Delete Designer',
				designer: results.designer,
				designer_boardgames: results.designers_boardgames,
			});
		}
	);
};

exports.designer_delete_post = function (req, res, next) {
	async.parallel(
		{
			designer(callback) {
				Designer.findById(req.params.id).exec(callback);
			},
			designers_boardgames(callback) {
				Boardgame.find({ designers: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.designer == null) {
				res.redirect('/designer');
			}
			if (results.designers_boardgames !== null) {
				results.designers_boardgames.forEach((boardgame) => {
					Boardgame.findById(boardgame._id).exec(function (
						err,
						game
					) {
						if (err) {
							return next(err);
						}
						const filteredDesigners = game.designers.filter(
							(designer) => designer !== results.designer
						);
						Boardgame.findByIdAndUpdate(
							boardgame._id,
							{ designers: filteredDesigners },
							(err) => {
								if (err) {
									return next(err);
								}
							}
						);
					});
				});
			}

			Designer.findByIdAndDelete(req.params.id, (err) => {
				if (err) {
					return next(err);
				}
				res.redirect('/designer');
			});
		}
	);
};
