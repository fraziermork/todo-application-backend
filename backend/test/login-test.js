'use strict';

// set up env variable to only use a particular test database
const mongoose      = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_app_test';
const server        = require(`${__dirname}/../server`);
const port          = process.env.API_PORT || 3000;

// Set up chai and require other npm modules
const debug         = require('debug')('todo:loginRouterTest'); 
const btoa          = require('btoa');
const chai          = require('chai');
const chaiHttp      = require('chai-http');
chai.use(chaiHttp);
const request       = chai.request(`localhost:${port}`);
const expect        = chai.expect; 

// Require in my modules
const User          = require(`${__dirname}/../resources/user/user-model`);

// Require in testing utilites
const manageServer  = require(`${__dirname}/test-lib/manage-server`)(mongoose, server, port);

// Variables to use in requests 
let originalUser  = { 
  username: 'EffDeeArr', 
  password: 'LetsMakeANewDeal', 
  email:    'fdr@whitehouse.gov'
};
let savedUser     = null;


describe('ENDPOINT: /login', () => {
  before('open server before block', (done) => {
    debug('before block');
    manageServer.checkIfServerRunningBeforeTests(done);
  });
  before('save a user to the database', (done) => {
    User.create(originalUser, (err, user) => {
      if (err) debug('ERROR: ', err);
      savedUser = user;
      done();
    });
  });
  after('close server afterwards and drop database', (done) => {
    debug('after block');
    manageServer.closeServerAndDbAfterTests(done);
  });
  
  describe('testing GET success', () => {
    before('make GET request for user', (done) => {
      request.get('/login')
        .auth(originalUser.username, originalUser.password)
        .end((err, res) => {
          this.err = err;
          this.res = res;
          done();
        });
    });
    it('should return the user and an authorization token', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body.username).to.equal(savedUser.username);
      expect(this.res.body.email).to.equal(savedUser.email);
      expect(this.res.body).to.have.property('creationDate');
      expect(this.res.body._id.toString()).to.equal(savedUser._id.toString());
      expect(this.res.body.lists).to.be.instanceof(Array);
      expect(this.res.headers).to.have.property('set-cookie');
    });
  });
  
  describe('testing GET errors', () => {
    describe('error on incorrect password', () => {
      before('make GET request for user', (done) => {
        request.get('/login')
          .auth(originalUser.username, 'incorrectPassword')
          .end((err, res) => {
            this.err = err;
            this.res = res;
            done();
          });
      });
      it('should have sent back an error', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(401);
        expect(this.res.body).to.eql({});
      });
    });
    describe('error on nonexistent user', () => {
      before('make GET request for user', (done) => {
        request.get('/login')
          .auth('HonestAbe', 'FourScoreAndSeven')
          .end((err, res) => {
            this.err = err;
            this.res = res;
            done();
          });
      });
      it('should have sent back an error', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(401);
        expect(this.res.body).to.eql({});
      });
    });
    describe('error on invalid headers', () => {
      before('make GET request for user', (done) => {
        let b64String = btoa('incorrect:junk');
        request.get('/login')
          .set('Authorization', `Basic ${b64String}`)
          .end((err, res) => {
            this.err = err;
            this.res = res;
            done();
          });
      });
      it('should have sent back an error', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(401);
        expect(this.res.body).to.eql({});
      });
    });
  });
});
