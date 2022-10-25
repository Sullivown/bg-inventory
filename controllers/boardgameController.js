const Boardgame = require('../models/boardgame');
const Designer = require('../models/designer');
const Publisher = require('../models/publisher');
const Category = require('../models/category');
const BoardgameInstance = require('../models/boardgameinstance');

const async = require('async');
const { body, validationResult } = require('express-validator');

exports.boardgame_list = function (req, res, next) {
	Boardgame.find()
		.sort([['name', 'ascending']])
		.exec(function (err, list_boardgames) {
			if (err) {
				return next(err);
			}
			res.render('boardgame_list', {
				title: 'Board Games',
				boardgame_list: list_boardgames,
			});
		});
};

exports.boardgame_detail = function (req, res, next) {
	async.parallel(
		{
			boardgame(callback) {
				Boardgame.findById(req.params.id)
					.populate('designers')
					.populate('publishers', 'name')
					.populate('categories')
					.exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			res.render('boardgame_detail', {
				title: 'Board Game Detail',
				boardgame: results.boardgame,
			});
		}
	);
};

exports.boardgame_create_get = function (req, res, next) {
	async.parallel(
		{
			designers(callback) {
				Designer.find()
					.sort([['name', 'ascending']])
					.exec(callback);
			},
			publishers(callback) {
				Publisher.find()
					.sort([['name', 'ascending']])
					.exec(callback);
			},
			categories(callback) {
				Category.find()
					.sort([['name', 'ascending']])
					.exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			res.render('boardgame_form', {
				title: 'Create Boardgame',
				designers: results.designers,
				publishers: results.publishers,
				categories: results.categories,
			});
		}
	);
};

exports.boardgame_create_post = [
	// Convert the designers, publishers and categories to an array.
	(req, res, next) => {
		if (!Array.isArray(req.body.designers)) {
			req.body.designers =
				typeof req.body.designers === 'undefined'
					? []
					: [req.body.designers];
		}
		if (!Array.isArray(req.body.publishers)) {
			req.body.publishers =
				typeof req.body.publishers === 'undefined'
					? []
					: [req.body.publishers];
		}
		if (!Array.isArray(req.body.categories)) {
			req.body.categories =
				typeof req.body.categories === 'undefined'
					? []
					: [req.body.categories];
		}
		next();
	},

	// Validate and sanitize data
	body('title')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('You must enter a name'),
	body('release_year')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('You must enter a year in numeric format')
		.isLength({ min: 4, max: 4 })
		.withMessage('You must enter a year using the format YYYY')
		.optional({ checkFalsy: true }),
	body('min_players')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Min players: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Min players: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	body('max_players')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Max players: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Max players: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	body('min_playing_time')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Min playing time: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Min playing time: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	body('max_playing_time')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Max playing time: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Max playing time: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	body('weight')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Weight: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Weight: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	(req, res, next) => {
		const errors = validationResult(req);

		const boardgame = new Boardgame({
			title: req.body.title,
			release_year: req.body.release_year || undefined,
			designers: req.body.designers,
			publishers: req.body.publishers,
			description: {
				short: req.body.short_description,
				full: req.body.full_description,
			},
			number_of_players: {
				min: req.body.min_players || undefined,
				max: req.body.max_players || undefined,
			},
			playing_time: {
				min: req.body.min_playing_time || undefined,
				max: req.body.max_playing_time || undefined,
			},
			weight: req.body.weight || undefined,
			categories: req.body.categories,
		});

		if (!errors.isEmpty()) {
			async.parallel(
				{
					designers(callback) {
						Designer.find()
							.sort([['name', 'ascending']])
							.exec(callback);
					},
					publishers(callback) {
						Publisher.find()
							.sort([['name', 'ascending']])
							.exec(callback);
					},
					categories(callback) {
						Category.find()
							.sort([['name', 'ascending']])
							.exec(callback);
					},
				},
				(err, results) => {
					if (err) {
						return next(err);
					}
					// Mark selected designers, publishers and categories as checked
					for (const designer of results.designers) {
						if (boardgame.designers.includes(designer._id)) {
							designer.checked = 'true';
						}
					}
					for (const publisher of results.publishers) {
						if (boardgame.publishers.includes(publisher._id)) {
							publisher.checked = 'true';
						}
					}
					for (const category of results.categories) {
						if (boardgame.categories.includes(category._id)) {
							category.checked = 'true';
						}
					}
					// There are errors. Render form again with sanitized values/errors messages.
					res.render('boardgame_form', {
						title: 'Create Boardgame',
						boardgame,
						designers: results.designers,
						publishers: results.publishers,
						categories: results.categories,
						errors: errors.array(),
					});
				}
			);
			return;
		}

		// Otherwise form is valid
		// Create new boardgame and redirect to detail view on success
		boardgame.save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect(boardgame.url);
		});
	},
];

exports.boardgame_update_get = function (req, res, next) {
	async.parallel(
		{
			boardgame(callback) {
				Boardgame.findById(req.params.id)
					.populate('designers')
					.populate('publishers')
					.populate('categories')
					.exec(callback);
			},
			designers(callback) {
				Designer.find()
					.sort([['name', 'ascending']])
					.exec(callback);
			},
			publishers(callback) {
				Publisher.find()
					.sort([['name', 'ascending']])
					.exec(callback);
			},
			categories(callback) {
				Category.find()
					.sort([['name', 'ascending']])
					.exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			// Mark selected designers, publishers and categories as checked
			for (const designer of results.designers) {
				for (const boardgameDesigner of results.boardgame.designers) {
					if (
						designer._id.toString() ===
						boardgameDesigner._id.toString()
					) {
						designer.checked = 'true';
					}
				}
			}
			for (const publisher of results.publishers) {
				for (const boardgamePublisher of results.boardgame.publishers) {
					if (
						publisher._id.toString() ===
						boardgamePublisher._id.toString()
					) {
						publisher.checked = 'true';
					}
				}
			}
			for (const category of results.categories) {
				for (const boardgameCategory of results.boardgame.categories) {
					if (
						category._id.toString() ===
						boardgameCategory._id.toString()
					) {
						category.checked = 'true';
					}
				}
			}

			res.render('boardgame_form', {
				title: 'Update Boardgame',
				boardgame: results.boardgame,
				designers: results.designers,
				publishers: results.publishers,
				categories: results.categories,
			});
		}
	);
};

exports.boardgame_update_post = [
	// Convert the designers, publishers and categories to an array.
	(req, res, next) => {
		if (!Array.isArray(req.body.designers)) {
			req.body.designers =
				typeof req.body.designers === 'undefined'
					? []
					: [req.body.designers];
		}
		if (!Array.isArray(req.body.publishers)) {
			req.body.publishers =
				typeof req.body.publishers === 'undefined'
					? []
					: [req.body.publishers];
		}
		if (!Array.isArray(req.body.categories)) {
			req.body.categories =
				typeof req.body.categories === 'undefined'
					? []
					: [req.body.categories];
		}
		next();
	},

	// Validate and sanitize data
	body('title')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('You must enter a name'),
	body('release_year')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('You must enter a year in numeric format')
		.isLength({ min: 4, max: 4 })
		.withMessage('You must enter a year using the format YYYY')
		.optional({ checkFalsy: true }),
	body('min_players')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Min players: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Min players: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	body('max_players')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Max players: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Max players: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	body('min_playing_time')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Min playing time: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Min playing time: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	body('max_playing_time')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Max playing time: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Max playing time: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	body('weight')
		.trim()
		.escape()
		.isNumeric()
		.withMessage('Weight: You must enter a number format')
		.isInt({ min: 0 })
		.withMessage('Weight: You must enter a number greater than 0')
		.optional({ checkFalsy: true }),
	(req, res, next) => {
		const errors = validationResult(req);

		const boardgame = new Boardgame({
			title: req.body.title,
			release_year: req.body.release_year || undefined,
			designers: req.body.designers,
			publishers: req.body.publishers,
			description: {
				short: req.body.short_description,
				full: req.body.full_description,
			},
			number_of_players: {
				min: req.body.min_players || undefined,
				max: req.body.max_players || undefined,
			},
			playing_time: {
				min: req.body.min_playing_time || undefined,
				max: req.body.max_playing_time || undefined,
			},
			weight: req.body.weight || undefined,
			categories: req.body.categories,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			async.parallel(
				{
					designers(callback) {
						Designer.find()
							.sort([['name', 'ascending']])
							.exec(callback);
					},
					publishers(callback) {
						Publisher.find()
							.sort([['name', 'ascending']])
							.exec(callback);
					},
					categories(callback) {
						Category.find()
							.sort([['name', 'ascending']])
							.exec(callback);
					},
				},
				(err, results) => {
					if (err) {
						return next(err);
					}

					// Mark selected designers, publishers and categories as checked
					for (const designer of results.designers) {
						if (boardgame.designers.includes(designer._id)) {
							designer.checked = 'true';
						}
					}
					for (const publisher of results.publishers) {
						if (boardgame.publishers.includes(publisher._id)) {
							publisher.checked = 'true';
						}
					}
					for (const category of results.categories) {
						if (boardgame.categories.includes(category._id)) {
							category.checked = 'true';
						}
					}
					// There are errors. Render form again with sanitized values/errors messages.
					res.render('boardgame_form', {
						title: 'Update Boardgame',
						boardgame,
						designers: results.designers,
						publishers: results.publishers,
						categories: results.categories,
						errors: errors.array(),
					});
				}
			);
			return;
		}
		// Data from form is valid.
		Boardgame.findByIdAndUpdate(
			req.params.id,
			boardgame,
			(err, theboardgame) => {
				if (err) {
					return next(err);
				}

				// Successful: redirect to boardgame detail page.
				res.redirect(theboardgame.url);
			}
		);
	},
];

exports.boardgame_delete_get = function (req, res, next) {
	async.parallel(
		{
			boardgame(callback) {
				Boardgame.findById(req.params.id).exec(callback);
			},
			boardgames_instances(callback) {
				BoardgameInstance.find({ boardgame: req.params.id }).exec(
					callback
				);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.boardgame == null) {
				res.redirect('/boardgame');
			}
			res.render('boardgame_delete', {
				title: 'Delete Boardgame',
				boardgame: results.boardgame,
				boardgame_instances: results.boardgames_instances,
			});
		}
	);
};

exports.boardgame_delete_post = function (req, res, next) {
	async.parallel(
		{
			boardgame(callback) {
				Boardgame.findById(req.params.id).exec(callback);
			},
			boardgames_instances(callback) {
				BoardgameInstance.find({ boardgame: req.params.id }).exec(
					callback
				);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.boardgame == null) {
				res.redirect('/boardgame');
			}
			if (results.boardgames_instances !== null) {
				results.boardgames_instances.forEach((instance) => {
					BoardgameInstance.findByIdAndDelete(instance, (err) => {
						if (err) {
							return next(err);
						}
						res.redirect('/boardgame');
					});
				});
			}

			Boardgame.findByIdAndDelete(req.params.id, (err) => {
				if (err) {
					return next(err);
				}
				res.redirect('/boardgame');
			});
		}
	);
};
