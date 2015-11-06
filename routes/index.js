var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var models = require('../models/models.js');
var jwt = require('jsonwebtoken');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
