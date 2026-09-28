const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');

router.post('/calcular', freteController.calcular);
router.post('/estimar', freteController.estimar);

module.exports = router;