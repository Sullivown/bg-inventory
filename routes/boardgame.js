const express = require('express');

const boardgame_controller = require('../controllers/boardgameController');

const router = express.Router();

router.get('/', boardgame_controller.boardgame_list);

router.get('/create', boardgame_controller.boardgame_create_get);

router.post('/create', boardgame_controller.boardgame_create_post);

router.get('/:id/update', boardgame_controller.boardgame_update_get);

router.post('/:id/update', boardgame_controller.boardgame_update_post);

router.get('/:id/delete', boardgame_controller.boardgame_delete_get);

router.post('/:id/delete', boardgame_controller.boardgame_delete_post);

router.get('/:id', boardgame_controller.boardgame_detail);

module.exports = router;
