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
const expect                = chai.expect; 
chai.use(chaiHttp);

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


let otherUser       = {
  username: 'DishonestAbe',
  password: 'FourScoreAndSix',
  email:    'lincoln@lighthouse.gov'
};
let otherRequest    = null;
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
      request     = authenticatedRequest('/lists', authToken);
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
      otherRequest    = authenticatedRequest('/lists', otherAuthToken);
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
        description:  'Civil war battles that the Union lost.'
      };
      request('post', done, { data: testList })
        .end((err, res) => {
          if (err) debug(`ERROR POSTING LIST: ${err}`);
          testList = res.body;
          done();
        });
    });
    
    describe('testing GET by id success', () => {
      before('make GET request beforehand', (done) => {
        request('get', done, { id: testList._id.toString() })
          .end((err, res) => {
            this.err = err;
            this.res = res;
            done();
          });
      });
      it('should return the list', () => {
        debug(this.res.body);
        expect(this.err).to.equal(null);
        expect(this.res.status).to.equal(200);
        expect(this.res.body.name).to.equal(testList.name);
        expect(this.res.body.description).to.equal(testList.description);
        expect(this.res.body).to.have.property('creationDate');
        expect(this.res.body.items).to.be.instanceof(Array);
      });
    });
    
    describe('testing GET by id errors', () => {
      describe('failure when list doesnt exist', () => {
        before('make flawed GET request beforehand', (done) => {
          request('get', done, { id: 'notARealId' })
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
      
      describe('it should error out without an XSRF-TOKEN cookie header', () => {
        before('make flawed GET request beforehand', (done) => {
          request('get', done, { id: testList._id.toString(), cookie: false })
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
        before('make flawed GET request beforehand', (done) => {
          request('get', done, { id: testList._id.toString(), 'X-XSRF-TOKEN': false })
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
      
      describe('it should error out when the XSRF-TOKEN cookie belongs to another user', () => {
        before('make flawed GET request beforehand', (done) => {
          request('get', done, { id: testList._id.toString(), cookie: `XSRF-TOKEN=${otherAuthToken}` })
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
      
      describe('it should error out when the X-XSRF-TOKEN belongs to another user', () => {
        before('make flawed GET request beforehand', (done) => {
          request('get', done, { id: testList._id.toString(), 'X-XSRF-TOKEN': otherAuthToken.toString() })
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
      
      describe('it should error out when both the X-XSRF-TOKEN and XSRF-TOKEN cookie belong to another user', () => {
        before('make flawed GET request beforehand', (done) => {
          otherRequest('get', done, { id: testList._id.toString() })
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
      request('post', done, { data: testList })
        .end((err, res) => {
          if (err) debug('ERROR POSTING LIST: ', err);
          testList = res.body;
          done();
        });
    });
    describe('PUT success', () => {
      before('make PUT request beforehand', (done) => {
        this.changes = {
          description: 'Legislation ushered through, not dudes named William.'
        };
        request('put', done, { id: testList._id.toString(), data: this.changes })
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
    describe('PUT error', () => {
      describe('failure when list doesnt exist', function() {
        // must use function, not arrow function, otherwise this.timeout(milliseconds) doesn't work 
        this.timeout(5000);
        
        this.changes = { description: 'shouldnt work because no list exists with id "notARealId"' };
        before('make flawed PUT request beforehand', (done) => {
          request('put', done, { id: 'notARealId', data: this.changes })
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
      describe('it should error out without an XSRF-TOKEN cookie header', () => {
        this.changes = {
          description: 'No XSRF-TOKEN cookie header.'
        };
        before('make flawed PUT request beforehand', (done) => {
          request('put', done, { 
            id:     testList._id.toString(), 
            data:   this.changes, 
            cookie: false 
          })
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
        this.changes = {
          description: 'No X-XSRF-TOKEN header.'
        };
        before('make flawed PUT request beforehand', (done) => {
          request('put', done, { 
            id:             testList._id.toString(), 
            data:           this.changes, 
            'X-XSRF-TOKEN': false 
          })
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
      
      describe('it should error out when the XSRF-TOKEN cookie belongs to another user', () => {
        this.changes = {
          description: 'Someone elses XSRF-TOKEN cookie header.'
        };
        before('make flawed PUT request beforehand', (done) => {
          request('put', done, { 
            id:     testList._id.toString(), 
            data:   this.changes, 
            cookie: `XSRF-TOKEN=${otherAuthToken}` 
          })
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
      
      describe('it should error out when the X-XSRF-TOKEN belongs to another user', () => {
        this.changes = {
          description: 'Someone elses X-XSRF-TOKEN header.'
        };
        before('make flawed PUT request beforehand', (done) => {
          request('put', done, { 
            id:             testList._id.toString(), 
            data:           this.changes, 
            'X-XSRF-TOKEN': otherAuthToken 
          })
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
      
      describe('it should error out when both the X-XSRF-TOKEN and XSRF-TOKEN cookie belong to another user', () => {
        this.changes = {
          description: 'Authenticated user does not own specified list .'
        };
        before('make flawed PUT request beforehand', (done) => {
          otherRequest('put', done, { 
            id:             testList._id.toString(), 
            data:           this.changes
          })
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
        description:  'Legislation vetoed.' 
      };
      request('post', done, { data: testList })
        .end((err, res) => {
          if (err) debug('ERROR POSTING LIST: ', err);
          testList = res.body;
          done();
        });
    });
    
    describe('DELETE success', () => {
      before('make the DELETE request beforehand', (done) => {
        request('delete', done, { id: testList._id.toString() })
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
          description:  'Legislation vetoed.'
          
        };
        request('post', done, { data: testList })
          .end((err, res) => {
            if (err) debug('ERROR POSTING LIST: ', err);
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
      it('should have removed the reference to the list from the user', (done) => {
        User.findById(currentUser._id, (err, user) => {
          expect(err).to.equal(null);
          let lists = user.toObject().lists;
          expect(lists.indexOf(testList._id.toString())).to.equal(-1);
          done();
        });
      });
    });
  
    describe('DELETE errors', function() {
      this.timeout(5000);
      describe('it should error out without an XSRF-TOKEN cookie header', () => {
        before('make the DELETE request beforehand', (done) => {
          request('put', done, { 
            id:     testList._id.toString(), 
            cookie: false 
          })
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
        before('make the DELETE request beforehand', (done) => {
          request('delete', done, { 
            id:             testList._id.toString(), 
            'X-XSRF-TOKEN': false 
          })
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
      describe('it should error out when the XSRF-TOKEN cookie belongs to another user', () => {
        before('make the DELETE request beforehand', (done) => {
          request('put', done, { 
            id:     testList._id.toString(), 
            cookie: `XSRF-TOKEN=${otherAuthToken}` 
          })
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
      describe('it should error out when the X-XSRF-TOKEN belongs to another user', () => {
        before('make the DELETE request beforehand', (done) => {
          request('delete', done, { 
            id:             testList._id.toString(), 
            'X-XSRF-TOKEN': otherAuthToken 
          })
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
      describe('it should error out when both the X-XSRF-TOKEN and XSRF-TOKEN cookie belong to another user', () => {
        before('make the DELETE request beforehand', (done) => {
          otherRequest('delete', done, { id: testList._id.toString() })
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
      describe('failure if list doesnt exist ', () => {
        before('make the flawed DELETE request beforehand', (done) => {
          request('delete', done, { id: 'notARealId' })
            .end((err, res) => {
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
