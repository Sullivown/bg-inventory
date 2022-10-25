const express = require('express');

const boardgameinstance_controller = require('../controllers/boardgameinstanceController');

const router = express.Router();

router.get('/', boardgameinstance_controller.boardgameinstance_list);

router.get(
	'/create',
	boardgameinstance_controller.boardgameinstance_create_get
);

router.post(
	'/create',
	boardgameinstance_controller.boardgameinstance_create_post
);

router.get(
	'/:id/update',
	boardgameinstance_controller.boardgameinstance_update_get
);

router.post(
	'/:id/update',
	boardgameinstance_controller.boardgameinstance_update_post
);

router.get(
	'/:id/delete',
	boardgameinstance_controller.boardgameinstance_delete_get
);

router.post(
	'/:id/delete',
	boardgameinstance_controller.boardgameinstance_delete_post
);

router.get('/:id', boardgameinstance_controller.boardgameinstance_detail);

module.exports = router;
