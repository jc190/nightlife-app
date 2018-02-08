var Businesses = require('../models/businesses.js');
var Users = require('../models/users.js');

function GoingHandler () {
  this.getNumGoing = function(req, res) {
    var business_id = req.params.id;
    Businesses
      .findOne({ id: business_id })
      .exec(function(err, result) {
        if (err) { throw err; }
        if (!result) {
          var business = new Businesses({ 
            id: business_id,
            going: 0
          });
          business.save(function (err) {
            if (err) { throw err; }
            res.json(business.going)
          });
        } else {
          res.json(result.going);
        }
      });
  }
  this.addToGoing = function(req, res) {
    var business_id = req.params.id;
    Users
      .findOneAndUpdate({ 'github.id': req.user.github.id }, { $addToSet: { goingList: business_id } })
      .exec(function(err, result) {
        if (err) { throw err; }
        if (!result.goingList.includes(business_id)) {
          Businesses
            .findOneAndUpdate({ id: business_id }, { $inc: { going: 1 } }, { new: true })
            .exec(function (err, result) {
              if (err) { throw err; }
              res.json(result.going);
            });
        } else {
          removeFromGoing(req, res);
        }
      });
  }
}

function removeFromGoing (req, res) {
  var business_id = req.params.id;
  Users
    .findOneAndUpdate({ 'github.id': req.user.github.id }, { $pull: { goingList: business_id } })
    .exec(function(err, result) {
      if (err) { throw err; }
      if (result.goingList.includes(business_id)) {
        Businesses
          .findOneAndUpdate({ id: business_id }, { $inc: { going: -1 } }, { new: true })
          .exec(function (err, result) {
            if (err) { throw err; }
            res.json(result.going);
          });
      }
    });
}

module.exports = GoingHandler;