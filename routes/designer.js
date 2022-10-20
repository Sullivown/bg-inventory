const express = require('express');
const router = express.Router();

const designer_controller = require('../controllers/designerController');

router.get('/', designer_controller.designer_list);

router.get('/create', designer_controller.designer_create_get);

router.post('/create', designer_controller.designer_create_post);

router.get('/:id', designer_controller.designer_detail);

module.exports = router;
