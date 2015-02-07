var should       = require("should");
var db           = require("secondthought");
var assert       = require("assert");
var Registration = require("../lib/registration");
var Auth         = require("../lib/authentication");
var Membership   = require("../index");

describe("Main API", function () {

  var memb = {};

  before(function(done) {
    memb = new Membership("membership");

    db.connect({ db: "membership" }, function(err, db){
      db.users.destroyAll(function(err, result) {
        done();
      });
    });

  });

  describe("authentication", function () {
    var newUser = {};

    before(function (done) {
      memb.register("demo1@gmail.com", "password", "password", function(err, result) {
        newUser = result.user;

        assert.ok(result.success, "Can't register");
        done();
      });
    });

    it("authenticates", function(done) {
      memb.authenticate("demo1@gmail.com", "password", function(err, result) {
        result.success.should.equal(true);
        done();
      });
    });

    it("gets by token", function(done) {
      memb.findUserByToken(newUser.authenticationToken, function(err, result) {
        should.exist(result);
        done();
      });
    });

  });

});
