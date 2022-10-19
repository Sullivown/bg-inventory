#! /usr/bin/env node

console.log(
	'This script populates some data to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Boardgame = require('./models/boardgame');
var BoardgameInstance = require('./models/boardgameinstance');
var Category = require('./models/category');
var Designer = require('./models/designer');
var Publisher = require('./models/publisher');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var boardgames = [];
var boardgameinstances = [];
var categories = [];
var designers = [];
var publishers = [];

function designerCreate(name, cb) {
	var designer = new Designer({ name: name });

	designer.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New designer: ' + designer);
		designers.push(designer);
		cb(null, designer);
	});
}

function categoryCreate(name, cb) {
	var category = new Category({ name: name });

	category.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New category: ' + category);
		categories.push(category);
		cb(null, category);
	});
}

function publisherCreate(name, website, cb) {
	var publisherDetail = { name: name, website: website };
	var publisher = new Publisher(publisherDetail);

	publisher.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New publisher: ' + publisher);
		publishers.push(publisher);
		cb(null, publisher);
	});
}

function boardgameCreate(
	title,
	release_year,
	designers,
	publishers,
	description_short,
	description_full,
	min_players,
	max_players,
	min_time,
	max_time,
	weight,
	categories,
	cb
) {
	boardgamedetail = {
		title: title,
		release_year: release_year,
		designers: designers,
		publishers: publishers,
		description: {
			short: description_short,
			full: description_full,
		},
		number_of_players: {
			min: min_players,
			max: max_players,
		},
		playing_time: {
			min: min_time,
			max: max_time,
		},
		weight: weight,
		categories: categories,
	};

	var boardgame = new Boardgame(boardgamedetail);
	boardgame.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New boardgame: ' + boardgame);
		boardgames.push(boardgame);
		cb(null, boardgame);
	});
}

function boardgameInstanceCreate(boardgame, status, created, due_back, cb) {
	var boardgameinstancedetail = {
		boardgame: boardgame,
	};
	if (created != false) boardgameinstancedetail.created = created;
	if (due_back != false) boardgameinstancedetail.due_back = due_back;
	if (status != false) boardgameinstancedetail.status = status;

	var boardgameinstance = new BoardgameInstance(boardgameinstancedetail);
	boardgameinstance.save(function (err) {
		if (err) {
			console.log(
				'ERROR CREATING boardgameInstance: ' + boardgameinstance
			);
			cb(err, null);
			return;
		}
		console.log('New boardgameInstance: ' + boardgameinstance);
		boardgameinstances.push(boardgameinstance);
		cb(null, boardgame);
	});
}

function createDesigners(cb) {
	async.series(
		[
			function (callback) {
				designerCreate('Isaac Childres', callback);
			},
			function (callback) {
				designerCreate('Gavan Brown', callback);
			},
			function (callback) {
				designerCreate('Matt Tolman', callback);
			},
			function (callback) {
				designerCreate('Martin Wallace', callback);
			},
			function (callback) {
				designerCreate('Elizabeth Hargrave', callback);
			},
		],
		// optional callback
		cb
	);
}

function createPublishers(cb) {
	async.series(
		[
			function (callback) {
				publisherCreate(
					'Stonemeier Games',
					'https://stonemaiergames.com/',
					callback
				);
			},
			function (callback) {
				publisherCreate('Roxley', 'https://roxley.com/', callback);
			},
			function (callback) {
				publisherCreate(
					'Arclight Games',
					'http://www.arclight.co.jp/ag/',
					callback
				);
			},
			function (callback) {
				publisherCreate(
					'Cephalofair Games',
					'https://cephalofair.com/',
					callback
				);
			},
		],
		// optional callback
		cb
	);
}

function createCategories(cb) {
	async.series(
		[
			function (callback) {
				categoryCreate('Adventure', callback);
			},
			function (callback) {
				categoryCreate('Exploration', callback);
			},
			function (callback) {
				categoryCreate('Fantasy', callback);
			},
			function (callback) {
				categoryCreate('Miniatures', callback);
			},
			function (callback) {
				categoryCreate('Animals', callback);
			},
			function (callback) {
				categoryCreate('Educational', callback);
			},
			function (callback) {
				categoryCreate('Economic', callback);
			},
			function (callback) {
				categoryCreate('Industry', callback);
			},
		],
		// optional callback
		cb
	);
}

function createBoardgames(cb) {
	async.parallel(
		[
			function (callback) {
				boardgameCreate(
					'Gloomhaven',
					2017,
					[designers[0]],
					[publishers[3], publishers[2]],
					'Vanquish monsters with strategic cardplay. Fulfill your quest to leave your legacy!',
					'Gloomhaven is a game of Euro-inspired tactical combat in a persistent world of shifting motives. Players will take on the role of a wandering adventurer with their own special set of skills and their own reasons for traveling to this dark corner of the world. Players must work together out of necessity to clear out menacing dungeons and forgotten ruins. In the process, they will enhance their abilities with experience and loot, discover new locations to explore and plunder, and expand an ever-branching story fueled by the decisions they make.',
					1,
					4,
					60,
					120,
					3.89,
					[
						categories[0],
						categories[1],
						categories[2],
						categories[3],
					],
					callback
				);
			},
			function (callback) {
				boardgameCreate(
					'Wingspan',
					2019,
					[designers[4]],
					[publishers[0]],
					'Attract a beautiful and diverse collection of birds to your wildlife preserve.',
					'Wingspan is a competitive, medium-weight, card-driven, engine-building board game from Stonemaier Games. It is designed by Elizabeth Hargrave and features over 170 birds illustrated by Beth Sobel, Natalia Rojas, and Ana Maria Martinez. You are bird enthusiasts—researchers, bird watchers, ornithologists, and collectors—seeking to discover and attract the best birds to your network of wildlife preserves. Each bird extends a chain of powerful combinations in one of your habitats (actions). These habitats focus on several key aspects of growth.',
					1,
					5,
					40,
					70,
					2.45,
					[categories[4], categories[5]],
					callback
				);
			},
			function (callback) {
				boardgameCreate(
					'Brass: Birmingham',
					2018,
					[designers[1], designers[2], designers[3]],
					[publishers[1], publishers[2]],
					'Build networks, grow industries, and navigate the world of the Industrial Revolution.',
					'Brass: Birmingham is an economic strategy game sequel to the Martin Wallace 2007 masterpiece, Brass. Brass: Birmingham tells the story of competing entrepreneurs in Birmingham during the industrial revolution, between the years of 1770-1870. As in its predecessor, you must develop, build, and establish your industries and network, in an effort to exploit low or high market demands.',
					2,
					4,
					60,
					120,
					3.91,
					[categories[6], categories[7]],
					callback
				);
			},
		],
		// optional callback
		cb
	);
}
//boardgame, status, created, due_back, cb
function createBoardgameInstances(cb) {
	async.parallel(
		[
			function (callback) {
				boardgameInstanceCreate(callback);
				boardgames[0], false, false, false, callback;
			},
			function (callback) {
				boardgameInstanceCreate(callback);
				boardgames[0], false, false, false, callback;
			},
			function (callback) {
				boardgameInstanceCreate(callback);
				boardgames[1], false, false, false, callback;
			},
			function (callback) {
				boardgameInstanceCreate(callback);
				boardgames[2], false, false, false, callback;
			},
		],
		// Optional callback
		cb
	);
}

async.series(
	[
		createDesigners,
		createPublishers,
		createCategories,
		createBoardgames,
		createBoardgameInstances,
	],
	// Optional callback
	function (err, results) {
		if (err) {
			console.log('FINAL ERR: ' + err);
		} else {
			console.log('BGInstances: ' + boardgameinstances);
		}
		// All done, disconnect from database
		mongoose.connection.close();
	}
);
