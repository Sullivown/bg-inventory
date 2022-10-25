const BoardgameInstance = require('../models/boardgameinstance');
const Boardgame = require('../models/boardgame');

const async = require('async');
const { body, validationResult } = require('express-validator');

exports.boardgameinstance_list = function (req, res, next) {
	BoardgameInstance.find()
		.sort([['boardgame', 'ascending']])
		.populate('boardgame')
		.exec(function (err, list_boardgameinstances) {
			if (err) {
				return next(err);
			}
			res.render('boardgameinstance_list', {
				title: 'Board Game Instances',
				boardgameinstance_list: list_boardgameinstances,
			});
		});
};

exports.boardgameinstance_detail = function (req, res, next) {
	BoardgameInstance.findById(req.params.id)
		.populate('boardgame')
		.exec(function (err, boardgameinstance) {
			if (err) {
				return next(err);
			}
			res.render('boardgameinstance_detail', {
				title: 'Board Game Instance Detail',
				boardgameinstance,
			});
		});
};

exports.boardgameinstance_create_get = function (req, res, next) {
	Boardgame.find()
		.sort([['title', 'ascending']])
		.exec(function (err, boardgame_list) {
			if (err) {
				return next(err);
			}
			res.render('boardgameinstance_form', {
				title: 'Create Board Game Instance',
				boardgames: boardgame_list,
			});
		});
};

exports.boardgameinstance_create_post = [
	body('boardgame', 'Boardgame must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('boardgameinstance_form', {
				title: 'Create Board Game Instance',
				boardgameinstance: req.body,
				errors: errors.array(),
			});
			return;
		}
		// Data from form is valid.
		// Create a Boardgame Instance object with escaped and trimmed data.
		const boardgameinstance = new BoardgameInstance({
			boardgame: req.body.boardgame,
		});
		boardgameinstance.save((err) => {
			if (err) {
				return next(err);
			}
			// Successful - redirect to new boardgameinstance record.
			res.redirect(boardgameinstance.url);
		});
	},
];

exports.boardgameinstance_update_get = function (req, res, next) {
	async.parallel(
		{
			boardgameinstance(callback) {
				BoardgameInstance.findById(req.params.id)
					.populate('boardgame')
					.exec(callback);
			},
			boardgames_list(callback) {
				Boardgame.find().exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			res.render('boardgameinstance_form', {
				title: 'Update Board Game Instance',
				boardgameinstance: results.boardgameinstance,
				boardgames: results.boardgames_list,
			});
		}
	);
};

exports.boardgameinstance_update_post = [
	body('boardgame', 'Boardgame must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		const boardgameinstance = new BoardgameInstance({
			boardgame: req.body.boardgame,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('boardgameinstance_form', {
				title: 'Create Board Game Instance',
				boardgameinstance: req.body,
				errors: errors.array(),
			});
			return;
		}
		// Data from form is valid.
		BoardgameInstance.findByIdAndUpdate(
			req.params.id,
			boardgameinstance,
			(err, theboardgameinstance) => {
				if (err) {
					return next(err);
				}

				// Successful: redirect to boardgameinstance detail page.
				res.redirect(theboardgameinstance.url);
			}
		);
	},
];

exports.boardgameinstance_delete_get = function (req, res, next) {
	BoardgameInstance.findById(req.params.id).exec(function (
		err,
		boardgameinstance
	) {
		if (err) {
			return next(err);
		}
		res.render('boardgameinstance_delete', {
			title: 'Delete Board Game Instance',
			boardgameinstance,
		});
	});
};

exports.boardgameinstance_delete_post = function (req, res, next) {
	BoardgameInstance.findByIdAndDelete(req.params.id).exec(function (err) {
		if (err) {
			return next(err);
		}
		res.redirect('/boardgameinstance');
	});
};
