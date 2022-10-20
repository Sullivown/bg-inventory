const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('boardgame_list', { title: 'Boardgames', boardgames: null });
});

module.exports = router;
