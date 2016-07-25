'use strict';

// Set up env variable to only use a particular test database
const mongoose      = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_app_test';
const server        = require(`${__dirname}/../server`);
const port          = process.env.API_PORT || 3000;

// Set up chai and require other npm modules
const debug         = require('debug')('todo:newAccountRouterTest'); 
const chai          = require('chai');
const chaiHttp      = require('chai-http');
chai.use(chaiHttp);
const request       = chai.request(`localhost:${port}`);
const expect        = chai.expect; 

// Require in my modules
const User          = require(`${__dirname}/../resources/user/user-model`);

// Require in testing utilites
const manageServer  = require(`${__dirname}/test-lib/manage-server`)(mongoose, server, port);
const userCreate    = require(`${__dirname}/test-lib/user-create`)(request, User);



describe('ENDPOINT: /new-account', () => {
  before('open server before block', (done) => {
    debug('before block');
    manageServer.checkIfServerRunningBeforeTests(done);
  });
  
  after('close server afterwards and drop database', (done) => {
    debug('after block');
    manageServer.closeServerAndDbAfterTests(done);
  });
  
  describe('testing POST success', () => {
    before('make POST request beforehand', (done) => {
      this.originalUser = {
        username: 'georgeWashington', 
        password: 'oralHygiene', 
        email:    'cherrytree@whitehouse.gov' 
      };
      userCreate.postUserBefore.call(this, this.originalUser, done);
    });
    
    it('should return a user an an authorization token', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body.username).to.equal(this.originalUser.username);
      expect(this.res.body.email).to.equal(this.originalUser.email);
      expect(this.res.body).to.have.property('creationDate');
      expect(this.res.body.lists).to.be.instanceof(Array);
      expect(this.res.headers).to.have.property('set-cookie');
    });
    
    it('should have saved the user to the database', (done) => {
      User.findById(this.res.body._id, (err, user) => {
        expect(err).to.equal(null);
        expect(user.username).to.equal(this.res.body.username);
        done();
      });
    });
  });
  
  describe('testing POST errors', () => {
    describe('failure on post with invalid email', () => {
      before('make repeat POST request beforehand', (done) => {
        this.originalUser = { 
          username: 'georgeWashington', 
          password: 'oralHygiene', 
          email:    'cherrytree@' 
        };
        userCreate.postUserBefore.call(this, this.originalUser, done);
      });
      
      it('should have sent a 400 error for a bad email', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(400);
        expect(this.res.body).to.eql({});
      });
    });
  //   
    describe('failure on post of existing user', () => {
      before('make repeat POST request beforehand', (done) => {
        this.originalUser = { 
          username: 'georgeWashington', 
          password: 'oralHygiene', 
          email:    'cherrytree@whitehouse.gov' 
        };
        debug('newAccountRouterTest making request');
        userCreate.postUserBefore.call(this, this.originalUser, done);
      });
      
      it('should have sent a 400 error for a post of an existing user', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(400);
        expect(this.res.body).to.eql({});
      });
    });
    
    describe('failure on invalid information provided', () => {
      before('make flawed POST request beforehand', (done) => {
        this.originalUser = { 
          // not providing a password, which is required
          username: 'georgeWashington', 
          email:    'cherrytree@whitehouse.gov' 
        };
        debug('newAccountRouterTest making request');
        userCreate.postUserBefore.call(this, this.originalUser, done);
      });
      
      it('should have sent a 400 error if insufficient info provided', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(400);
        expect(this.res.body).to.eql({});
      });
    });
    describe('wrong method used on endpoint', () => {
      before('make incorrect GET request beforehand', (done) => {
        debug('newAccountRouterTest making request');
        // not using userCreate here because I need to make a GET request instead
        request.get('/new-account')
          .end((err, res) => {
            debug('newAccountRouterTest request callback');
            this.err = err;
            this.res = res;
            done();
          });
      });
      
      it('should have sent a 404 error if request uses wrong method', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(404);
        expect(this.res.body).to.eql({});
      });
    });
  });
});
