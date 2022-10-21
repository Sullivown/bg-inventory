const express = require('express');
const router = express.Router();

const designer_controller = require('../controllers/designerController');

router.get('/', designer_controller.designer_list);

router.get('/create', designer_controller.designer_create_get);

router.post('/create', designer_controller.designer_create_post);

router.get('/:id/update', designer_controller.designer_update_get);

router.post('/:id/update', designer_controller.designer_update_post);

router.get('/:id/delete', designer_controller.designer_delete_get);

router.post('/:id/delete', designer_controller.designer_delete_post);

router.get('/:id', designer_controller.designer_detail);

module.exports = router;
