const express = require('express');
const router = express.Router();
const bandeiraController = require('../controllers/bandeiraController');

router.get('/bandeiras', bandeiraController.listar);

module.exports = router;