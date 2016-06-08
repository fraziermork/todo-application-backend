'use strict';

// DEBUG=newAccountRouterTest,newAccountRouter,manageServer,SERVER,userCtrl,User,log,AppError,errMidware

// set up env variable to only use a particular test database
const mongoose      = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_app_test';
const server        = require(`${__dirname}/../server`);
const port          = process.env.API_PORT || 3000;

const debug         = require('debug')('newAccountRouterTest'); 
const User          = require(`${__dirname}/../resources/user/user-model`);
const manageServer  = require(`${__dirname}/test-lib/manage-server`)(mongoose, server, port);
// const request       = require(`${__dirname}/test-lib/request`)(`localhost:${port}`);

// Set up chai 
const chai          = require('chai');
const chaiHttp      = require('chai-http');
chai.use(chaiHttp);
const request       = chai.request(`localhost:${port}`);
const expect        = chai.expect; 

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
      debug('this.originalUser: ', this.originalUser.password);
      debug('newAccountRouterTest making request');
      request.post('/new-account')
        .send(this.originalUser)
        .end((err, res) => {
          debug('newAccountRouterTest request callback');
          this.err = err;
          this.res = res;
          done();
        });
    });
    
    it('should return a user an an authorization token', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body.user.username).to.equal(this.originalUser.username);
      expect(this.res.body.user.email).to.equal(this.originalUser.email);
      expect(this.res.body.user).to.have.property('creationDate');
      expect(this.res.body).to.have.property('token');
    });
    
    it('should have saved the user to the database', (done) => {
      User.findById(this.res.body.user._id, (err, user) => {
        expect(err).to.equal(null);
        expect(user.username).to.equal(this.res.body.user.username);
        done();
      });
    });
  });
  
  describe('testing POST errors', () => {
    describe('failure on post of existing user', () => {
      before('make repeat POST request beforehand', (done) => {
        this.originalUser = { 
          username: 'georgeWashington', 
          password: 'oralHygiene', 
          email:    'cherrytree@whitehouse.gov' 
        };
        debug('newAccountRouterTest making request');
        request.post('/new-account')
          .send(this.originalUser)
          .end((err, res) => {
            debug('newAccountRouterTest request callback');
            this.err = err;
            this.res = res;
            done();
          });
      });
      
      it('should have sent an error', () => {
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
        request.post('/new-account')
          .send(this.originalUser)
          .end((err, res) => {
            debug('newAccountRouterTest request callback');
            this.err = err;
            this.res = res;
            done();
          });
      });
      
      it('should have sent an error', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(400);
        expect(this.res.body).to.eql({});
      });
    });
    describe('wrong method used on endpoint', () => {
      before('make incorrect GET request beforehand', (done) => {
        debug('newAccountRouterTest making request');
        request.get('/new-account')
          .end((err, res) => {
            debug('newAccountRouterTest request callback');
            this.err = err;
            this.res = res;
            done();
          });
      });
      
      it('should have sent an error', () => {
        expect(this.err).to.not.equal(null);
        
        // this should probably be changed to 404, but because it's picked up by the '*' after the tokenAuthMidware, it gets a 401 instead
        expect(this.res.status).to.equal(401);
        expect(this.res.body).to.eql({});
      });
    });
  });
});
