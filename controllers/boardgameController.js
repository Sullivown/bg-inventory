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
				title: 'Boardgame Detail',
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
			res.render('boardgame_form', {
				title: 'Create Boardgame',
				boardgame: req.body,
				errors: errors.array(),
			});
			return;
		}

		// Otherwise form is valid
		// Create new boardgame and redirect to detail view on success
		const boardgame = new Boardgame({
			name: req.body.name,
			website: req.body.website,
		});

		boardgame.save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect(boardgame.url);
		});
	},
];

exports.boardgame_update_get = function (req, res, next) {
	Boardgame.findById(req.params.id).exec(function (err, boardgame) {
		if (err) {
			return next(err);
		}
		res.render('boardgame_form', {
			title: 'Boardgame Detail',
			boardgame: boardgame,
		});
	});
};

exports.boardgame_update_post = [
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('You must enter a name'),
	body('website').trim().isURL().withMessage('You must enter a valid url'),
	(req, res, next) => {
		const errors = validationResult(req);

		const boardgame = new Boardgame({
			name: req.body.name,
			website: req.body.website,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('boardgame_form', {
				title: 'Update Boardgame',
				boardgame,
				errors: errors.array(),
			});
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
			boardgames_boardgames(callback) {
				Boardgame.find({ boardgames: req.params.id }).exec(callback);
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
				boardgame_boardgames: results.boardgames_boardgames,
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
			boardgames_boardgames(callback) {
				Boardgame.find({ boardgames: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.boardgame == null) {
				res.redirect('/boardgame');
			}
			if (results.boardgames_boardgames !== null) {
				results.boardgames_boardgames.forEach((boardgame) => {
					Boardgame.findById(boardgame._id).exec(function (
						err,
						game
					) {
						if (err) {
							return next(err);
						}
						const filteredBoardgames = game.boardgames.filter(
							(boardgame) => boardgame !== results.boardgame
						);
						Boardgame.findByIdAndUpdate(
							boardgame._id,
							{ boardgames: filteredBoardgames },
							(err) => {
								if (err) {
									return next(err);
								}
							}
						);
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
