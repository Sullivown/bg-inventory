const Category = require('../models/category');
const Boardgame = require('../models/boardgame');

const async = require('async');
const { body, validationResult } = require('express-validator');

exports.category_list = function (req, res, next) {
	Category.find()
		.sort([['name', 'ascending']])
		.exec(function (err, list_categories) {
			if (err) {
				return next(err);
			}
			res.render('category_list', {
				title: 'Categories',
				category_list: list_categories,
			});
		});
};

exports.category_detail = function (req, res, next) {
	async.parallel(
		{
			category(callback) {
				Category.findById(req.params.id).exec(callback);
			},
			categories_boardgames(callback) {
				Boardgame.find({ categories: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			res.render('category_detail', {
				title: 'Category Detail',
				category: results.category,
				category_boardgames: results.categories_boardgames,
			});
		}
	);
};

exports.category_create_get = function (req, res, next) {
	res.render('category_form', { title: 'Create Category' });
};

exports.category_create_post = [
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('You must enter a name'),
	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('category_form', {
				title: 'Create Category',
				category: req.body,
				errors: errors.array(),
			});
			return;
		}

		const category = new Category({
			name: req.body.name,
		});

		category.save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect(category.url);
		});
	},
];

exports.category_update_get = function (req, res, next) {
	Category.findById(req.params.id).exec(function (err, category) {
		if (err) {
			return next(err);
		}
		res.render('category_form', {
			title: 'Category Detail',
			category: category,
		});
	});
};

exports.category_update_post = [
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('You must enter a name'),
	(req, res, next) => {
		const errors = validationResult(req);

		const category = new Category({
			name: req.body.name,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('category_form', {
				title: 'Update Category',
				category,
				errors: errors.array(),
			});
			return;
		}

		// Data from form is valid.
		Category.findByIdAndUpdate(
			req.params.id,
			category,
			(err, thecategory) => {
				if (err) {
					return next(err);
				}

				// Successful: redirect to category detail page.
				res.redirect(thecategory.url);
			}
		);
	},
];

exports.category_delete_get = function (req, res, next) {
	async.parallel(
		{
			category(callback) {
				Category.findById(req.params.id).exec(callback);
			},
			categories_boardgames(callback) {
				Boardgame.find({ categories: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.category == null) {
				res.redirect('/category');
			}
			res.render('category_delete', {
				title: 'Delete Category',
				category: results.category,
				category_boardgames: results.categories_boardgames,
			});
		}
	);
};

exports.category_delete_post = function (req, res, next) {
	async.parallel(
		{
			category(callback) {
				Category.findById(req.params.id).exec(callback);
			},
			categories_boardgames(callback) {
				Boardgame.find({ categories: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.category == null) {
				res.redirect('/category');
			}
			if (results.categories_boardgames !== null) {
				results.categories_boardgames.forEach((boardgame) => {
					Boardgame.findById(boardgame._id).exec(function (
						err,
						game
					) {
						if (err) {
							return next(err);
						}
						const filteredCategorys = game.categories.filter(
							(category) => category !== results.category
						);
						Boardgame.findByIdAndUpdate(
							boardgame._id,
							{ categories: filteredCategorys },
							(err) => {
								if (err) {
									return next(err);
								}
							}
						);
					});
				});
			}

			Category.findByIdAndDelete(req.params.id, (err) => {
				if (err) {
					return next(err);
				}
				res.redirect('/category');
			});
		}
	);
};
