var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var models = require('../models/models.js');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var config = require('../config');
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var bcrypt = require('bcrypt');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

router.post('/register', function(req, res, next) {
    models.User.findOne({ 'username': req.body.username }, function (err, user) {
        if (user) {
            res.status(400).json({success: false, message: 'User with that name exists'});
        } else {
            var hash = bcrypt.hashSync(req.body.password, 8);
            var user = new models.User({ _id: mongoose.Types.ObjectId(), username: req.body.username, password: hash });
            user.save(function (err) {
                if (err) {
                    console.log(err);
                    res.status(500).json({success: false, message: 'Unable to create user'});
                } else {
                    var token = jwt.sign(user._id, config.secretKey);
                    res.json({success: true, token: token});
                }
            });
        }
    });
});

router.post('/login', function(req, res, next) {
    models.User.findOne({ 'username': req.body.username }, function (err, user) {
        if (err) {
            console.log(err);
            res.status(500).json({success:false, message:'Well this is bad'});
        } else if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                var token = jwt.sign(user._id, config.secretKey);
                res.json({success: true, token: token});
            } else {
                res.status(400).json({success:false, message:'Passwords don\'t match'});
            }
        } else {
            res.status(400).json({success:false, message:'No such user exists'});
        }
    });
});

router.get('/blogs', function(req, res, next) {
    models.Blog.find({}, function (err, blogs) {
        res.json(blogs);
    });
});

router.get('/blogs/:blogId', function(req, res, next) {
    models.Blog.findOne({_id: req.params.blogId}, function (err, blog) {
        res.json(blog);
    });
});

router.get('/blogs/:blogId/pages', function(req, res, next) {
    models.Page.find({_blog: req.params.blogId}, function (err, pages) {
        res.json(pages);
    });
});

router.use(function(req, res, next) {
    var token;

    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            var scheme = parts[0],
            credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else {
            return res.status(401).json({err: 'Format is Authorization: Bearer [token]'});
        }
    } else {
        return res.status(401).json({err: 'No Authorization header was found'});
    }

    if (token) {
        jwt.verify(token, config.secretKey, function(err, userId) {      
            if (err) {
                return res.status(403).json({ success: falese, message: 'Failed to verify token.' });    
            } else {
                console.log('Verified token, fetching user.');
                models.User.findOne({_id: userId}, function (err, user) {
                    console.log('Got user ' + user.username);
                    req.user = user;
                    next();
                });
            }
        });
    } else {
        return res.status(403).json({success: false, message: 'No token provided.' });
    }
});

router.get('/profile', function(req, res, next) {
    var user = req.user;
    models.User.findOne({_id: user._id}, function (err, user) {
        res.json(user);
    });
});

router.post('/blogs', function(req, res, next) {
    var user = req.user;
    var blog = new models.Blog({ _id: mongoose.Types.ObjectId(), title: req.body.blogTitle, _owner: user._id });
    blog.save(function (err) {
        if (err) {
            console.log(err);
            res.json({success: false, message: "Unable to insert blog"});
        } else {
            res.json(blog);
        }
    });
});

router.delete('/blogs/:blogId', function(req, res, next) {
    models.Blog.findOne({_id: req.params.blogId}).remove(function(err) {
        if (err) {
            console.log(err);
            res.json({success: false, message: "Unable to delete blog"});
        } else {
            res.json({success: true, message: "Deleted blog"});
        }
    });
});

router.post('/blogs/:blogId/pages', multipartMiddleware, function(req, res, next) {
    var user = req.user;
    var pageId = mongoose.Types.ObjectId();
    var filePath;

    if (req.files) {
        var filePath = config.uploadDir + pageId;
        fs.readFile(req.files.file.path, function (err, data) {
            fs.writeFile('public/' + filePath, data, function (err) {
                if (err) {
                    console.log(err);
                    res.json({success: false, message: "Unable to insert page"});
                } else {
                    console.log('Saved image successfully: ' + filePath);
                    var page = new models.Page({ _id: pageId, title: req.body.title, body: req.body.body, imagePath: filePath, _blog: req.params.blogId });
                    page.save(function (err) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({success: false, message: "Unable to insert page"});
                        } else {
                            console.log('Saved page successfully: ' + page);
                            res.json(page);
                        }
                    });
                }
            });
        });
    } else {
        var page = new models.Page({ _id: pageId, title: req.body.title, body: req.body.body, _blog: req.params.blogId });
        page.save(function (err) {
            if (err) {
                console.log(err);
                res.status(500).json({success: false, message: "Unable to insert page"});
            } else {
                console.log('Saved page successfully: ' + page);
                res.json(page);
            }
        });
    }

});

router.delete('/blogs/:blogId/pages/:pageId', function(req, res, next) {
    var user = req.user;
    models.Page.findOne({_id:req.params.pageId}).remove(function(err) {
        if (err) {
            console.log(err);
            res.json({success: false, message: "Unable to delete page"});
        } else {
            res.json({success: true, message: "Deleted page"});
        }
    });
});

module.exports = router;
