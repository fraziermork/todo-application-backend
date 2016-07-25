'use strict';

// set up env variable to only use a particular test database
const mongoose      = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_app_test';
const server        = require(`${__dirname}/../server`);
const port          = process.env.API_PORT || 3000;

// Set up chai and require other npm modules
const debug         = require('debug')('todo:itemsRouterTest'); 
const chai          = require('chai');
const chaiHttp      = require('chai-http');
const expect        = chai.expect; 
chai.use(chaiHttp);

// Require in my modules
const Item          = require(`${__dirname}/../resources/item/item-model`);
const List          = require(`${__dirname}/../resources/list/list-model`);
const User          = require(`${__dirname}/../resources/user/user-model`);

// Require in testing utilites
const manageServer  = require(`${__dirname}/test-lib/manage-server`)(mongoose, server, port);
const authenticatedRequest  = require(`${__dirname}/test-lib/authenticated-request`)(chai.request, `localhost:${port}`);

// Variables to use in requests 
let currentUser     = {
  username:     'RickSanchez',
  password:     'MeeseeksUnity',
  email:        'WubbaLubbaDubDub@C137.com'
};
let authToken       = null;
let request         = null;

let otherUser       = {
  username:     'PrinceNebulon',
  password:     'concentratedDarkMatter',
  email:        'scam@zigeria.com'
};
let otherAuthToken  = null;
let otherRequest    = null;


let currentList     = {
  name:         'Enemies',
  description:  'they messed up.'
};


describe('ENDPOINT: /lists/:listId/items/:itemId', () => {
  before('open server before block', (done) => {
    manageServer.checkIfServerRunningBeforeTests(done);
  });
  before('save user and get authorization token beforehand', (done) => {
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
  before('save list beforehand', (done) => {
    request('post', done, { data: currentList })
      .end((err, res) => {
        if (err) debug('err');
        currentList   = res.body;
        request       = authenticatedRequest(`/lists/${currentList._id}/items`, authToken);
        done();
      });
  });
  before('save other and get other authorization token beforehand', (done) => {
    User.create(otherUser, (err, user) => {
      if (err) {
        debug('ERROR SAVING USER: ', err);
        return done();
      }
      otherUser       = user;
      otherAuthToken  = user.generateToken();
      otherRequest    = authenticatedRequest(`/lists/${currentList._id}/items`, otherAuthToken);
      return done();
    });
  });
  after('close server afterwards and drop database', (done) => {
    manageServer.closeServerAndDbAfterTests(done);
  });
  
  
  
  
  
  
  
  
  
  // ////////////////////////////////////////////////////////////////////////////////
  // GET /items/:itemId 
  // ////////////////////////////////////////////////////////////////////////////////
  describe('testing GET item by id success', () => {
    let testItem = {
      name:     'Tammy', 
      content:  'Remember Bird Person'
    };
    before('make the POST beforehand', (done) => {
      request('post', done, { data: testItem })
      .end((err, res) => {
        if (err) debug('ERROR POSTING ITEM BEFORE:', err);
        testItem = res.body;
        done();
      });
    });
    before('making GET request beforehand', (done) => {
      request('get', done, { id: testItem._id.toString() })
        .end((err, res) => {
          this.err = err;
          this.res = res;
          done();
        });
    });
    it('should have returned an item', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body.name).to.equal(testItem.name);
      expect(this.res.body.content).to.equal(testItem.content);
      expect(this.res.body._id).to.equal(testItem._id);
      expect(this.res.body).to.not.have.property('list');
    });
    
  });
  describe('testing GET item by id errors', () => {
    let testItem = {
      name:     'Gearhead', 
      content:  'Revenge isnt taste as sweet for you'
    };
    before('make the POST beforehand', (done) => {
      request('post', done, { data: testItem })
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE:', err);
          testItem = res.body;
          done();
        });
    });
    
    describe('failure if list doesnt exist', () => {
      before('making GET request beforehand', (done) => {
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
    // Not implementing these tests, lists tests make this redundant because of how the middleware is implemented 
    // describe('failure if no auth token provided', () => {
    //   before('making GET request beforehand', (done) => {
    //     request.get(`/lists/${currentList._id}/items/${testItem._id.toString()}`)
    //       .end((err, res) => {
    //         this.err = err;
    //         this.res = res;
    //         done();
    //       });
    //   });
    //   it('should return a 401 error', () => {
    //     expect(this.err).to.not.equal(null);
    //     expect(this.res.status).to.equal(401);
    //     expect(this.res.body).to.eql({});
    //   });
    // });
    describe('failure if list is wrong', () => {
      before('making GET request beforehand', (done) => {
        // have to go back to authenticatedRequest to reset the endpoint
        authenticatedRequest('/lists', authToken)('get', done, { 
          id: `notARealId/items/${testItem._id}`
        })
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
    describe('failure if list belongs to another user', () => {
      before('making GET request beforehand', (done) => {
        otherRequest('get', done, { id: testItem._id.toString() })
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
  
  
  
  
  
  
  
  
  
  
  
  
  
  // ////////////////////////////////////////////////////////////////////////////////
  // PUT /items/:itemId 
  // ////////////////////////////////////////////////////////////////////////////////
  describe('testing PUT item by id success', () => {
    let testItem = {
      name:     'Tammy', 
      content:  'Remember Bird Person'
    };
    let updates = {
      content:  'Remember Bird Person. RIP.'
    };
    before('make the POST beforehand', (done) => {
      request('post', done, { data: testItem })
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE:', err);
          testItem = res.body;
          done();
        });
    });
    before('make the PUT beforehand', (done) => {
      request('put', done, { data: updates, id: testItem._id.toString() })
        .end((err, res) => {
          this.err = err;
          this.res = res;
          done();
        });
    });
    it('should have returned the updated item', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body.name).to.equal(testItem.name);
      expect(this.res.body.content).to.equal(updates.content);
    });
    it('should have updated the item in the database', (done) => {
      Item.findById(this.res.body._id, (err, item) => {
        expect(err).to.equal(null);
        expect(item.content).to.equal(updates.content);
        done();
      });
    });
  });
  
  describe('testing PUT item by id errors', () => {
    let testItem = {
      name:     'Zeep Xanflorp', 
      content:  'dance dance'
    };
    let updates = {
      content:  'dance dance, no revolution.'
    };
    before('make the POST beforehand', (done) => {
      request('post', done, { data: testItem })
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE:', err);
          testItem = res.body;
          done();
        });
    });
    describe('failure when item doesnt exist', function() {
      before('make the flawed PUT beforehand', (done) => {
        request('put', done, { data: updates, id: 'notARealId' })
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
    describe('failure when list doesnt exist', function() {
      before('make the flawed PUT beforehand', (done) => {
        authenticatedRequest('/lists', authToken)('get', done, { 
          id:   `notARealId/items/${testItem._id}`, 
          data: updates
        })
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
      before('make the flawed PUT beforehand', (done) => {
        request('put', done, { data: { creationDate: Date.now() }, id: testItem._id.toString() })
          .end((err, res) => {
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
  //   Not implementing these tests, lists tests make this redundant because of how the middleware is implemented   
  //   describe('failure without authtoken', () => {
  //     before('make the flawed PUT beforehand', (done) => {
  //       request.put(`/lists/${currentList._id}/items/${testItem._id}`)
  //         .send(updates)
  //         .end((err, res) => {
  //           this.err = err;
  //           this.res = res;
  //           done();
  //         });
  //     });
  //     it('should return a 401 error', () => {
  //       expect(this.err).to.not.equal(null);
  //       expect(this.res.status).to.equal(401);
  //       expect(this.res.body).to.eql({});
  //     });
  //   });
    describe('failure with wrong users authtoken', () => {
      before('make the flawed PUT beforehand', (done) => {
        otherRequest('put', done, { data: updates, id: testItem._id.toString() })
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
  
  
  
  
  
  
  
  
  
  
  
  
  // ////////////////////////////////////////////////////////////////////////////////
  // DELETE /items/:itemId 
  // ////////////////////////////////////////////////////////////////////////////////
  describe('testing DELETE item by id success', () => {
    let testItem = {
      name:     'Tammy', 
      content:  'Remember Bird Person'
    };
    before('make the POST beforehand', (done) => {
      request('post', done, { data: testItem })
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE:', err);
          testItem = res.body;
          done();
        });
    });
    before('making GET request beforehand', (done) => {
      request('delete', done, { id: testItem._id.toString() })
        .end((err, res) => {
          this.err = err;
          this.res = res;
          done();
        });
    });
    it('should return a 204', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(204);
    });
    it('should have deleted the reference to the item from the list', (done) => {
      List.findById(currentList._id, (err, list) => {
        expect(err).to.equal(null);
        expect(list.items.some((itemId) => {
          return itemId.toString() === testItem._id.toString();
        })).to.equal(false);
        done();
      });
    });
  });
  
  describe('testing DELETE item by id errors', () => {
    let testItem = {
      name:     'Tammy', 
      content:  'Remember Bird Person'
    };
    before('make the POST beforehand', (done) => {
      request('post', done, { data: testItem })
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE:', err);
          testItem = res.body;
          done();
        });
    });
    describe('failure if list is wrong', () => {
      before('making GET request beforehand', (done) => {
        authenticatedRequest('/lists', authToken)('delete', done, { 
          id:   `notARealId/items/${testItem._id}`
        })
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
    describe('failure if item doesnt exist ', () => {
      before('making GET request beforehand', (done) => {
        request('delete', done, { id: 'notARealId' })
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
  //   Not implementing these tests, lists tests make this redundant because of how the middleware is implemented   
  //   describe('failure if no auth token provided', () => {
  //     before('making GET request beforehand', (done) => {
  //       request.delete(`/lists/${currentList._id}/items/${testItem._id.toString()}`)
  //         .end((err, res) => {
  //           this.err = err;
  //           this.res = res;
  //           done();
  //         });
  //     });
  //     it('should return a 401 error', () => {
  //       expect(this.err).to.not.equal(null);
  //       expect(this.res.status).to.equal(401);
  //       expect(this.res.body).to.eql({});
  //     });
  //   });
    describe('failure if using wrong persons auth token', () => {
      before('making GET request beforehand', (done) => {
        otherRequest('delete', done, { id: testItem._id.toString() })
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
