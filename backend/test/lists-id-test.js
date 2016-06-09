'use strict';

// DEBUG=manageServer,SERVER,listCtrl,User,AppError,errMidware,listsRouterTest,listsRouter,tokenAuthMidware,userCtrl,User,List

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


let otherUser       = {
  username: 'DishonestAbe',
  password: 'FourScoreAndSix',
  email:    'lincoln@lighthouse.gov'
};
let otherAuthToken  = null;

describe('ENDPOINT: /lists/:id', () => {
  before('open server before block', (done) => {
    manageServer.checkIfServerRunningBeforeTests(done);
  });
  before('save currentUser and get authorization token', (done) => {
    User.create(currentUser, (err, user) => {
      if (err) {
        debug('ERROR SAVING CURRENTUSER: ', err);
        return done();
      }
      currentUser = user;
      authToken   = user.generateToken();
      return done();
    });
  });
  before('save otherUser and get authorization token', (done) => {
    User.create(otherUser, (err, user) => {
      if (err) {
        debug('ERROR SAVING OTHERUSER: ', err);
        return done();
      }
      otherUser       = user;
      otherAuthToken  = user.generateToken();
      return done();
    });
  });
  
  after('close server afterwards and drop database', (done) => {
    manageServer.closeServerAndDbAfterTests(done);
  });
  
  
  
  
  
  
  
  
  
  
  
  
  // ///////////////////////////////////////////////////////////////////////////
  // GET 
  // ///////////////////////////////////////////////////////////////////////////
  describe('testing GET by id', () => {
    let testList = null;
    
    before('posting list beforehand', (done) => {
      testList = {
        name:         'Confederate victories', 
        description:  'Civil war battles that the Union lost.', 
        owner:        currentUser._id.toString()
      };
      request.post('/lists')
        .set('Authorization', `Token ${authToken}`)
        .send(testList)
        .end((err, res) => {
          if (err) debug(`ERROR POSTING LIST: ${err}`);
          testList = res.body;
          done();
        });
    });
    
    describe('success', () => {
      before('make GET request beforehand', (done) => {
        request.get(`/lists/${testList._id}`)
          .set('Authorization', `Token ${authToken}`)
          .end((err, res) => {
            this.err = err;
            this.res = res;
            done();
          });
      });
      it('should return the list', () => {
        expect(this.err).to.equal(null);
        expect(this.res.status).to.equal(200);
        expect(this.res.body.name).to.equal(testList.name);
        expect(this.res.body).to.have.property('creationDate');
      });
    });
    
    describe('error', () => {
      describe('failure when list doesnt exist', () => {
        before('make GET request beforehand', (done) => {
          request.get('/lists/12345')
            .set('Authorization', `Token ${authToken}`)
            .end((err, res) => {
              this.err = err;
              this.res = res;
              done();
            });
        });
        it('should return a 404 error', () => {
          expect(this.err).to.not.equal(null);
          expect(this.res.status).to.equal(404);
          expect(this.res.body).to.eql({});
        });
      });
      
      describe('failure when no auth token present', () => {
        before('make GET request beforehand', (done) => {
          request.get(`/lists/${testList._id}`)
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
      
      describe('failure when auth token doesnt correspond to list owner', () => {
        before('make GET request beforehand', (done) => {
          request.get(`/lists/${testList._id}`)
            .set('Authorization', `Token ${otherAuthToken}`)
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
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  ///////////////////////////////////////////////////////////////////////////
  // PUT  
  ///////////////////////////////////////////////////////////////////////////
  describe('testing PUT by id', () => {
    let testList = null;
    before('post a list beforehand', (done) => {
      testList = {
        name:         'Bills passed', 
        description:  'Legislation ushered through.', 
        owner:        currentUser._id.toString()
      };
      request.post('/lists')
        .set('Authorization', `Token ${authToken}`)
        .send(testList)
        .end((err, res) => {
          if (err) debug(`ERROR POSTING LIST: ${err}`);
          testList = res.body;
          done();
        });
    });
    describe('success', () => {
      before('make PUT request beforehand', (done) => {
        this.changes = {
          description: 'Legislation ushered through, not dudes named William.'
        };
        request.put(`/lists/${testList._id}`)
          .send(this.changes)
          .set('Authorization', `Token ${authToken}`)
          .end((err, res) => {
            this.err = err;
            this.res = res;
            done();
          });
      });
      it('should allow valid updates', () => {
        expect(this.err).to.equal(null);
        expect(this.res.status).to.equal(200);
        expect(this.res.body.name).to.equal(testList.name);
        expect(this.res.body.description).to.equal(this.changes.description);
      });
      it('should have updated the list in the database', (done) => {
        List.findById(testList._id, (err, list) => {
          expect(list.name).to.equal(testList.name);
          expect(list.description).to.equal(this.changes.description);
          done();
        });
      });
    });
    describe('error', () => {
      describe('failure when list doesnt exist', function() {
        // must use function, not arrow function, otherwise this.timeout(milliseconds) doesn't work 
        this.timeout(5000);
        before('make GET request beforehand', (done) => {
          request.put('/lists/12345')
            .set('Authorization', `Token ${authToken}`)
            .send({ description: 'shouldnt work because no list exists with id 12345' })
            .end((err, res) => {
              this.err = err;
              this.res = res;
              done();
            });
        });
        it('should return a 404 error', () => {
          expect(this.err).to.not.equal(null);
          expect(this.res.status).to.equal(404);
          expect(this.res.body).to.eql({});
        });
      });
      describe('failure on invalid information', () => {
        before('make GET request beforehand', (done) => {
          request.put(`/lists/${testList._id}`)
            .set('Authorization', `Token ${authToken}`)
            .send({ owner: 'shouldnt work because cant edit a lists owner' })
            .end((err, res) => {
              this.err = err;
              this.res = res;
              done();
            });
        });
        it('should return a 404 error', () => {
          expect(this.err).to.not.equal(null);
          expect(this.res.status).to.equal(400);
          expect(this.res.body).to.eql({});
        });
      });
      describe('failure without authtoken', () => {
        before('make GET request beforehand', (done) => {
          request.put(`/lists/${testList._id}`)
            .send({ description: 'shouldnt work because can only edits if making authenticated requests' })
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
      describe('failure with wrong users authtoken', () => {
        before('make GET request beforehand', (done) => {
          request.put(`/lists/${testList._id}`)
            .set('Authorization', `Token ${otherAuthToken}`)
            .send({ description: 'shouldnt work because can only edit your own lists' })
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
  
  
  
  
  
  
  
  
  
  
  
  // ///////////////////////////////////////////////////////////////////////////
  // DELETE 
  // ///////////////////////////////////////////////////////////////////////////
  describe('testing DELETE by id', () => {
    let testList = null;
    before('post a list before each delete test', (done) => {
      testList = {
        name:         'Bills rejected', 
        description:  'Legislation vetoed.', 
        owner:        currentUser._id.toString()
      };
      request.post('/lists')
        .set('Authorization', `Token ${authToken}`)
        .send(testList)
        .end((err, res) => {
          if (err) return debug(`ERROR POSTING LIST: ${err}`);
          testList = res.body;
          done();
        });
    });
    describe('success', () => {
      before('make the DELETE request beforehand', (done) => {
        request.delete(`/lists/${testList._id.toString()}`)
          .set('Authorization', `Token ${authToken}`)
          .end((err, res) => {
            if (err) return debug(`ERROR POSTING LIST: ${err}`);
            this.err = err;
            this.res = res;
            done();
          });
      });
      after('post a list after a sucessful deletion', (done) => {
        testList = {
          name:         'Bills rejected', 
          description:  'Legislation vetoed.', 
          owner:        currentUser._id.toString()
        };
        request.post('/lists')
          .set('Authorization', `Token ${authToken}`)
          .send(testList)
          .end((err, res) => {
            if (err) return debug(`ERROR POSTING LIST: ${err}`);
            testList = res.body;
            done();
          });
      });
      it('should return a 204 status', () => {
        expect(this.err).to.equal(null);
        expect(this.res.status).to.equal(204);
        expect(this.res.body).to.eql({});
      });
      it('should have removed the list from the database', (done) => {
        List.findById(testList._id, (err, list) => {
          expect(err).to.equal(null);
          expect(list).to.equal(null);
          done();
        });
      });
      it('should have removed a reference to the list from the user', (done) => {
        User.findById(currentUser._id.toString(), (err, user) => {
          expect(err).to.equal(null);
          
          // confirm that this would work 
          expect(user.lists.indexOf(testList._id)).to.equal(-1);
          done();
        });
      });
    });
    describe('errors', function() {
      this.timeout(5000);
      describe('failure without auth token', () => {
        before('make the flawed DELETE request beforehand', (done) => {
          request.delete(`/lists/${testList._id.toString()}`)
            .end((err, res) => {
              if (err) debug(`ERROR POSTING LIST: ${err}`);
              this.err = err;
              this.res = res;
              done();
            });
        });
        it('should return 401 error', () => {
          debug(this.err);
          expect(this.err).to.not.equal(null);
          expect(this.res.status).to.equal(401);
          expect(this.res.body).to.eql({});
        });
      });
      
      describe('failure with another users auth token', () => {
        before('make the flawed DELETE request beforehand', (done) => {
          request.delete(`/lists/${testList._id.toString()}`)
            .set('Authorization', `Token ${otherAuthToken}`)
            .end((err, res) => {
              if (err) debug(`ERROR POSTING LIST: ${err}`);
              this.err = err;
              this.res = res;
              done();
            });
        });
        it('should return 401 error', () => {
          expect(this.err).to.not.equal(null);
          expect(this.res.status).to.equal(401);
          expect(this.res.body).to.eql({});
        });
      });
      
      describe('failure if list doesnt exist ', () => {
        before('make the flawed DELETE request beforehand', (done) => {
          request.delete('/lists/12345')
            .set('Authorization', `Token ${authToken}`)
            .end((err, res) => {
              if (err) debug(`ERROR POSTING LIST: ${err}`);
              this.err = err;
              this.res = res;
              done();
            });
        });
        it('should return 401 error', () => {
          expect(this.err).to.not.equal(null);
          expect(this.res.status).to.equal(404);
          expect(this.res.body).to.eql({});
        });
      });
    });
  });
  
});
