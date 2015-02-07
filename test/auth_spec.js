var should       = require("should");
var db           = require("secondthought");
var assert       = require("assert");
var Registration = require("../lib/registration");
var Auth         = require("../lib/authentication");

describe("Authentication", function() {

  var reg = {};
  var auth = {};

  before(function(done) {
    db.connect({ db: "membership" }, function(err, db){
      reg = new Registration(db);
      auth = new Auth(db);

      db.users.destroyAll(function(err, destroyed) {
        reg.applyForMembership({
          email: "tomysmile2@gmail.com",
          password: "demo",
          confirm: "demo"
        }, function(err, regResult) {
          assert.ok(regResult.success);
          done();
        });
      });
    });
  });

  describe("a valid login", function() {

    var authResult = {};

    before(function(done) {
      // log them in
      auth.authenticate({
        email: "tomysmile2@gmail.com",
        password: "demo"
      }, function(err, result) {
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });

    it("is successful", function(){
      authResult.success.should.equal(true);
    });

    it("return a user", function() {
      should.exist(authResult.user);
    });

    it("creates a log entry", function() {
      should.exist(authResult.log);
    });

    it("updates the user stats", function() {
      authResult.user.signInCount.should.be.above(0);
    });

    it("updates the signon dates", function() {
      should.exist(authResult.user.lastLoginAt);
      should.exist(authResult.user.currentLoginAt);
    });

  });

  describe("empty email", function() {
    var authResult = {};

    before(function(done) {
      // log them in
      auth.authenticate({
        email: null,
        password: "demo"
      }, function(err, result) {
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });

    it("is not successful", function() {
      authResult.success.should.equal(false);
    });

    it("returns a message saying 'Invalid login'", function() {
      authResult.message.should.equal('Invalid email or password');
    });

  });

  describe("empty password", function() {

    var authResult = {};

    before(function(done) {
      // log them in
      auth.authenticate({
        email: "tomysmile@gmail.com",
        password: null
      }, function(err, result) {
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });

    it("is not successful", function() {
      authResult.success.should.equal(false);
    });

    it("returns a message saying 'Invalid login'", function() {
      authResult.message.should.equal('Invalid email or password');
    });

  });

  describe("password doesn't match", function() {

    var authResult = {};

    before(function(done) {
      // log them in
      auth.authenticate({
        email: "tomysmile2@gmail.com",
        password: "wrongone"
      }, function(err, result) {
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });

    it("is not successful", function() {
      authResult.success.should.equal(false);
    });

    it("returns a message saying 'Invalid login'", function() {
      authResult.message.should.equal('Invalid email or password');
    });

  });

  describe("email not found", function() {

    var authResult = {};

    before(function(done) {
      // log them in
      auth.authenticate({
        email: "notexist@gmail.com",
        password: "password"
      }, function(err, result) {
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });

    it("is not successful", function() {
      authResult.success.should.equal(false);
    });

    it("returns a message saying 'Invalid login'", function() {
      authResult.message.should.equal('Invalid email or password');
    });

  });

});
