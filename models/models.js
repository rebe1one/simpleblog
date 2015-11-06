var mongoose = require('mongoose');

var blogSchema = mongoose.Schema({
  _id     : mongoose.Schema.Types.ObjectId,
  title   : String,
  _owner  : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pages : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }]
});

var userSchema = mongoose.Schema({
  _id       : mongoose.Schema.Types.ObjectId,
  username  : String,
  name      : String,
  password  : String,
});

var pageSchema = mongoose.Schema({
  _id       : mongoose.Schema.Types.ObjectId,
  _creator  : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title     : String,
  body      : String,
  imagePath : String,
  _blog     : { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }
});

var User = mongoose.model('User', userSchema);
var Blog = mongoose.model('Blog', blogSchema);
var Page = mongoose.model('Page', pageSchema);

module.exports.User = User;
module.exports.Blog = Blog;
module.exports.Page = Page;
