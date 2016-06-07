'use strict';

// DEBUG=manageServer,SERVER,listsCtrl,User,AppError,errMidware,listsRouterTest,listsRouter,tokenAuthMidware,userCtrl,User

// set up env variable to only use a particular test database
const mongoose      = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_app_test';
const server        = require(`${__dirname}/../server`);
const port          = process.env.API_PORT || 3000;

const debug         = require('debug')('listsRouterTest'); 
const List          = require(`${__dirname}/../resources/list/list-model`);
const User          = require(`${__dirname}/../resources/user/user-model`);
const manageServer  = require(`${__dirname}/test-lib/manage-server`)(mongoose, server, port);

// Set up chai 
const chai          = require('chai');
const chaiHttp      = require('chai-http');
chai.use(chaiHttp);
const request       = chai.request(`localhost:${port}`);
const expect        = chai.expect; 


let currentUser     = {
  username: 'HonestAbe',
  password: 'FourScoreAndSeven',
  email:    'lincoln@whitehouse.gov'
};
let authToken       = null;

describe('ENDPOINT: /lists', () => {
  before('open server before block', (done) => {
    manageServer.checkIfServerRunningBeforeTests(done);
  });
  before('save user and get authorization token', (done) => {
    User.create(currentUser, (err, user) => {
      if (err) {
        debug('ERROR SAVING USER: ', err);
        return done();
      }
      currentUser = user;
      authToken   = user.generateToken();
      return done();
    });
  });
  after('close server afterwards and drop database', (done) => {
    manageServer.closeServerAndDbAfterTests(done);
  });
  
  
  describe('testing POST success', () => {
    before('make POST request beforehand', (done) => {
      this.postedList = {
        name:         'Speeches', 
        description:  'Speeches I have given or plan to give.'
      };
      request.post('/lists')
        .set('Authorization', `Token ${authToken}`)
        .send(this.postedList)
        .end((err, res) => {
          if (err) debug(`ERROR POSTING LIST: ${err}`);
          this.err = err;
          this.res = res;
          done();
        });
    });
    it('should have returned a list', () => {
      console.log(this.res.body);
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body.name).to.equal(this.postedList.name);
      expect(this.res.body.description).to.equal(this.postedList.description);
      expect(this.res.body.owner).to.equal(currentUser._id.toString());
      expect(this.res.body).to.have.property('creationDate');
    });
    it('should have saved the list to the database', (done) => {
      List.findById(this.res.body._id, (err, list) => {
        expect(err).to.equal(null);
        expect(list.name).to.equal(this.postedList.name);
        done();
      });
    });
    it('should have saved the list to the user', (done) => {
      User.findById(currentUser._id.toString(), (err, user) => {
        expect(user.lists.length).to.equal(1);
        expect(user.lists[0].toString()).to.equal(this.res.body._id);
        done();
      });
    });
  });
  
  describe('testing POST errors', () => {
    describe('it should error out without an auth token', () => {
      before('making POST request without auth token', (done) => {
        this.postedList = {
          name:         'Speeches', 
          description:  'Speeches I have given or plan to give.'
        };
        request.post('/lists')
          .send(this.postedList)
          .end((err, res) => {
            this.err = err;
            this.res = res;
            done();
          });
      });
      it('should return a 401 error', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(401);
        expect(this.res.body).to.eql({});
      });
    });
    describe('it should error without a name included', () => {
      before('make POST request beforehand', (done) => {
        this.postedList = {
          description:  'Speeches I have given or plan to give.'
        };
        request.post('/lists')
          .set('Authorization', `Token ${authToken}`)
          .send(this.postedList)
          .end((err, res) => {
            if (err) debug(`ERROR POSTING LIST: ${err}`);
            this.err = err;
            this.res = res;
            done();
          });
      });
      it('should return a 400 error', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(400);
        expect(this.res.body).to.eql({});
      });
    });
  });
});
