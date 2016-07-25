'use strict';

// set up env variable to only use a particular test database
const mongoose              = require('mongoose');
process.env.MONGOLAB_URI    = 'mongodb://localhost/todo_app_test';
const server                = require(`${__dirname}/../server`);
const port                  = process.env.API_PORT || 3000;

// Set up chai and require other npm modules
const debug                 = require('debug')('todo:listsRouterTest'); 
const chai                  = require('chai');
const chaiHttp              = require('chai-http');
chai.use(chaiHttp);
const expect                = chai.expect; 

// Require in my modules
const List                  = require(`${__dirname}/../resources/list/list-model`);
const User                  = require(`${__dirname}/../resources/user/user-model`);

// Require in testing utilites
const manageServer          = require(`${__dirname}/test-lib/manage-server`)(mongoose, server, port);
const authenticatedRequest  = require(`${__dirname}/test-lib/authenticated-request`)(chai.request, `localhost:${port}`);

// Variables to use in requests 
let currentUser     = {
  username: 'HonestAbe',
  password: 'FourScoreAndSeven',
  email:    'lincoln@whitehouse.gov'
};
let request         = null;
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
      request     = authenticatedRequest('/lists', authToken);
      return done();
    });
  });
  after('close server afterwards and drop database', (done) => {
    manageServer.closeServerAndDbAfterTests(done);
  });
  
  
  // ////////////////////////////////////////
  // POST /lists
  // ////////////////////////////////////////
  describe('testing POST success', () => {
    before('make POST request beforehand', (done) => {
      this.postedList = {
        name:         'Speeches', 
        description:  'Speeches I have given or plan to give.'
      };
            
      request('post', done, { data: this.postedList })
        .end((err, res) => {
          if (err) debug(`ERROR POSTING LIST: ${err}`);
          this.err = err;
          this.res = res;
          done();
        });
    });
    it('should have returned a list', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body.name).to.equal(this.postedList.name);
      expect(this.res.body.description).to.equal(this.postedList.description);
      expect(this.res.body).to.have.property('creationDate');
      expect(this.res.body).to.have.property('_id');
      expect(this.res.body).to.not.have.property('owner');
    });
    it('should have saved the list to the database', (done) => {
      List.findById(this.res.body._id, (err, list) => {
        expect(err).to.equal(null);
        expect(list.name).to.equal(this.postedList.name);
        done();
      });
    });
    it('should have saved a reference to the list to the user', (done) => {
      User.findById(currentUser._id, (err, user) => {
        expect(err).to.equal(null);
        expect(user.lists.length).to.not.equal(0);
        expect(user.lists.indexOf(this.res.body._id)).to.not.equal(-1);
        done();
      });
    });
  });
  
  describe('testing POST errors', () => {
    describe('it should error out without an XSRF-TOKEN cookie header', () => {
      before('making POST request without auth token', (done) => {
        this.postedList = {
          name:         'Speeches', 
          description:  'Speeches I have given or plan to give.'
        };
        request('post', done, { data: this.postedList, cookie: false })
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
    describe('it should error out without an X-XSRF-TOKEN header', () => {
      before('making POST request without auth token', (done) => {
        this.postedList = {
          name:         'Speeches', 
          description:  'Speeches I have given or plan to give.'
        };
        request('post', done, { data: this.postedList, 'X-XSRF-TOKEN': false })
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
        request('post', done, { data: this.postedList })
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
  
  
  
  
  
  
  // ////////////////////////////////////////
  // GET /lists
  // ////////////////////////////////////////
  describe('testing GET all success', () => {
    before('adding lists to find beforehand', (done) => {
      this.testList = {
        name:         'Union victories', 
        description:  'Civil war battles that the Union won.', 
        owner:        currentUser._id.toString()
      };
      request('post', done, { data: this.testList })
        .end((err, res) => {
          if (err) debug(`ERROR POSTING LIST: ${err}`);
          this.testList = res.body;
          done();
        });
    });
    before('making GET request beforehand', (done) => {
      request('get', done)
        .end((err, res) => {
          this.err = err;
          this.res = res;
          done();
        });
    });
    it('should return all of your lists', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body).to.be.instanceof(Array);
      expect(this.res.body.length).to.not.equal(0);
      
      let arrayOfTestList = this.res.body.filter((list) => {
        return list._id === this.testList._id.toString();
      });
      expect(arrayOfTestList.length).to.not.equal(0);
      expect(arrayOfTestList[0].name).to.equal('Union victories');
    });
  });
  
  describe('testing GET all errors', () => {
    describe('it should error out if no XSRF-TOKEN cookie header present', () => {
      before('making GET request beforehand', (done) => {
        request('get', done, { cookie: false })
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
    describe('it should error out if no X-XSRF-TOKEN header present', () => {
      before('making GET request beforehand', (done) => {
        request('get', done, { 'X-XSRF-TOKEN': false })
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
  });
  
});





  
