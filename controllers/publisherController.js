const Publisher = require('../models/publisher');
const Boardgame = require('../models/boardgame');

const async = require('async');
const { body, validationResult } = require('express-validator');

exports.publisher_list = function (req, res, next) {
	Publisher.find()
		.sort([['name', 'ascending']])
		.exec(function (err, list_publishers) {
			if (err) {
				return next(err);
			}
			res.render('publisher_list', {
				title: 'Publishers',
				publisher_list: list_publishers,
			});
		});
};

exports.publisher_detail = function (req, res, next) {
	async.parallel(
		{
			publisher(callback) {
				Publisher.findById(req.params.id).exec(callback);
			},
			publishers_boardgames(callback) {
				Boardgame.find({ publishers: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			res.render('publisher_detail', {
				title: 'Publisher Detail',
				publisher: results.publisher,
				publisher_boardgames: results.publishers_boardgames,
			});
		}
	);
};

exports.publisher_create_get = function (req, res, next) {
	res.render('publisher_form', { title: 'Create Publisher' });
};

exports.publisher_create_post = [
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('You must enter a name'),
	body('website')
		.trim()
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage('You must enter a valid url'),
	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('publisher_form', {
				title: 'Create Publisher',
				publisher: req.body,
				errors: errors.array(),
			});
			return;
		}

		// Otherwise form is valid
		// Create new publisher and redirect to detail view on success
		const publisher = new Publisher({
			name: req.body.name,
			website: req.body.website,
		});

		publisher.save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect(publisher.url);
		});
	},
];

exports.publisher_update_get = function (req, res, next) {
	Publisher.findById(req.params.id).exec(function (err, publisher) {
		if (err) {
			return next(err);
		}
		res.render('publisher_form', {
			title: 'Publisher Detail',
			publisher: publisher,
		});
	});
};

exports.publisher_update_post = [
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('You must enter a name'),
	body('website').trim().isURL().withMessage('You must enter a valid url'),
	(req, res, next) => {
		const errors = validationResult(req);

		const publisher = new Publisher({
			name: req.body.name,
			website: req.body.website,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('publisher_form', {
				title: 'Update Publisher',
				publisher,
				errors: errors.array(),
			});
			return;
		}
		// Data from form is valid.

		Publisher.findByIdAndUpdate(
			req.params.id,
			publisher,
			(err, thepublisher) => {
				if (err) {
					return next(err);
				}

				// Successful: redirect to publisher detail page.
				res.redirect(thepublisher.url);
			}
		);
	},
];

exports.publisher_delete_get = function (req, res, next) {
	async.parallel(
		{
			publisher(callback) {
				Publisher.findById(req.params.id).exec(callback);
			},
			publishers_boardgames(callback) {
				Boardgame.find({ publishers: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.publisher == null) {
				res.redirect('/publisher');
			}
			res.render('publisher_delete', {
				title: 'Delete Publisher',
				publisher: results.publisher,
				publisher_boardgames: results.publishers_boardgames,
			});
		}
	);
};

exports.publisher_delete_post = function (req, res, next) {
	async.parallel(
		{
			publisher(callback) {
				Publisher.findById(req.params.id).exec(callback);
			},
			publishers_boardgames(callback) {
				Boardgame.find({ publishers: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.publisher == null) {
				res.redirect('/publisher');
			}
			if (results.publishers_boardgames !== null) {
				results.publishers_boardgames.forEach((boardgame) => {
					Boardgame.findById(boardgame._id).exec(function (
						err,
						game
					) {
						if (err) {
							return next(err);
						}
						const filteredPublishers = game.publishers.filter(
							(publisher) => publisher !== results.publisher
						);
						Boardgame.findByIdAndUpdate(
							boardgame._id,
							{ publishers: filteredPublishers },
							(err) => {
								if (err) {
									return next(err);
								}
							}
						);
					});
				});
			}

			Publisher.findByIdAndDelete(req.params.id, (err) => {
				if (err) {
					return next(err);
				}
				res.redirect('/publisher');
			});
		}
	);
};
