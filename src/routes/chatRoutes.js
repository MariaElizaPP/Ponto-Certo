const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/chat', chatController.processar);
router.post('/chat/feedback', chatController.avaliar);

module.exports = router;