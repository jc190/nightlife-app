'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Business = new Schema({
  id: String,
  going: Number
});

module.exports = mongoose.model('Business', Business);