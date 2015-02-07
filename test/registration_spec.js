var should       = require("should");
var db           = require("secondthought");
var Registration = require("../lib/registration");

describe("Registration", function(){

  var reg = {};
  before(function(done) {
    db.connect({ db: "membership" }, function(err, db){
      reg = new Registration(db);
      done();
    });
  });

  // happy path
  describe("a valid application", function() {
    var regResult = {};

    before(function(done){

      db.users.destroyAll(function(err, destroyed) {
        reg.applyForMembership({
          email: "tomysmile@gmail.com",
          password: "demo",
          confirm: "demo"
        }, function(err, result) {
          regResult = result;
          done();
        });
      });

    });

    it("is successful", function(){
      regResult.success.should.equal(true);
    });

    it("creates a user", function(){
      regResult.user.should.be.defined;
    });

    it("creates a log entry", function(){
      regResult.log.should.be.defined;
    });

    it("sets the user's status to approved", function(){
      regResult.user.status.should.equal("approved");
    });

    it("offers a welcome message", function(){
      regResult.message.should.equal("Welcome!");
    });

    it("incremenets the signInCount", function(){
      regResult.user.signInCount.should.equal(1);
    });

  });

  describe("an empty or null email", function() {
    var regResult = {};

    before(function(done){

      db.users.destroyAll(function(err, destroyed) {
        reg.applyForMembership({
          email: null,
          password: "demo",
          confirm: "demo"
        }, function(err, result) {
          regResult = result;
          done();
        });
      });

    });

    it("is not successful", function() {
      regResult.success.should.equal(false);
    });

    it("tells user that email is required", function () {
      regResult.message.should.equal("Email and password are required");
    });
  });

  describe("empty or null password", function() {
    var regResult = {};

    before(function(done){

      db.users.destroyAll(function(err, destroyed) {
        reg.applyForMembership({
          email: "tomysmile@gmail.com",
          password: "",
          confirm: "demo"
        }, function(err, result) {
          regResult = result;
          done();
        });
      });

    });

    it("is not successful", function() {
      regResult.success.should.equal(false);
    });

    it("tells user that email is required", function () {
      regResult.message.should.equal("Email and password are required");
    });
  });

  describe("password and confirm mismatch", function() {
    var regResult = {};

    before(function(done){

      db.users.destroyAll(function(err, destroyed) {
        reg.applyForMembership({
          email: "tomysmile@gmail.com",
          password: "abc",
          confirm: "cba"
        }, function(err, result) {
          regResult = result;
          done();
        });
      });

    });

    it("is not successful", function() {
      regResult.success.should.equal(false);
    });

    it("tells user that password don't match", function() {
      regResult.message.should.equal("Password don't match");
    });
  });

  describe("email already exists", function() {
    var regResult = {};

    before(function(done){
      db.users.destroyAll(function(err, destroyed) {
        reg.applyForMembership({
          email: "tomysmile@gmail.com",
          password: "demo",
          confirm: "demo"
        }, function(err, result) {

          // do another registration with same email
          reg.applyForMembership({
            email: "tomysmile@gmail.com",
            password: "demo",
            confirm: "demo"
          }, function(err, result) {
            regResult = result;
            done();
          });

        });
      });

    });

    it("is not successful", function() {
      regResult.success.should.equal(false);
    });

    it("tells user that email is already exists", function() {
      regResult.message.should.equal("This email already exists");
    });

  });

});
