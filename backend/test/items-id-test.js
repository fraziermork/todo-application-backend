'use strict';

// set up env variable to only use a particular test database
const mongoose      = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_app_test';
const server        = require(`${__dirname}/../server`);
const port          = process.env.API_PORT || 3000;

const debug         = require('debug')('todo:itemsRouterTest'); 
const Item          = require(`${__dirname}/../resources/item/item-model`);
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
  username:     'RickSanchez',
  password:     'MeeseeksUnity',
  email:        'WubbaLubbaDubDub@C137.com'
};
let authToken       = null;
let otherUser       = {
  username:     'PrinceNebulon',
  password:     'concentratedDarkMatter',
  email:        'scam@zigeria.com'
};
let otherAuthToken  = null;



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
      return done();
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
      return done();
    });
  });
  before('save list beforehand', (done) => {
    request.post('/lists')
      .set('Authorization', `Token ${authToken}`)
      .send(currentList)
      .end((err, res) => {
        if (err) debug('err');
        currentList = res.body;
        done();
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
      request.post(`/lists/${currentList._id}/items`)
      .set('Authorization', `Token ${authToken}`)
      .send(testItem)
      .end((err, res) => {
        if (err) debug('ERROR POSTING ITEM BEFORE:', err);
        testItem = res.body;
        done();
      });
    });
    before('making GET request beforehand', (done) => {
      request.get(`/lists/${currentList._id}/items/${testItem._id.toString()}`)
        .set('Authorization', `Token ${authToken}`)
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
    });
    
  });
  describe('testing GET item by id errors', () => {
    let testItem = {
      name:     'Gearhead', 
      content:  'Revenge doesnt taste as sweet for you'
    };
    before('make the POST beforehand', (done) => {
      request.post(`/lists/${currentList._id}/items`)
      .set('Authorization', `Token ${authToken}`)
      .send(testItem)
      .end((err, res) => {
        if (err) debug('ERROR POSTING ITEM BEFORE:', err);
        testItem = res.body;
        done();
      });
    });
    
    describe('failure if list doesnt exist', () => {
      before('making GET request beforehand', (done) => {
        request.get(`/lists/${currentList._id}/items/12345`)
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
    describe('failure if no auth token provided', () => {
      before('making GET request beforehand', (done) => {
        request.get(`/lists/${currentList._id}/items/${testItem._id.toString()}`)
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
    describe('failure if list is wrong', () => {
      before('making GET request beforehand', (done) => {
        request.get(`/lists/12345/items/${testItem._id.toString()}`)
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
    describe('failure if list belongs to another user', () => {
      before('making GET request beforehand', (done) => {
        request.get(`/lists/${currentList._id}/items/${testItem._id.toString()}`)
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
      request.post(`/lists/${currentList._id}/items`)
        .set('Authorization', `Token ${authToken}`)
        .send(testItem)
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE:', err);
          testItem = res.body;
          done();
        });
    });
    before('make the PUT beforehand', (done) => {
      request.put(`/lists/${currentList._id}/items/${testItem._id}`)
        .set('Authorization', `Token ${authToken}`)
        .send(updates)
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
      request.post(`/lists/${currentList._id}/items`)
        .set('Authorization', `Token ${authToken}`)
        .send(testItem)
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE:', err);
          testItem = res.body;
          done();
        });
    });
    describe('failure when item doesnt exist', function() {
      before('make the flawed PUT beforehand', (done) => {
        request.put(`/lists/${currentList._id}/items/12345`)
          .set('Authorization', `Token ${authToken}`)
          .send(updates)
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
        request.put(`/lists/12345/items/${testItem._id}`)
          .set('Authorization', `Token ${authToken}`)
          .send(updates)
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
        request.put(`/lists/${currentList._id}/items/${testItem._id}`)
          .set('Authorization', `Token ${authToken}`)
          .send({ creationDate: Date.now() })
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
    describe('failure without authtoken', () => {
      before('make the flawed PUT beforehand', (done) => {
        request.put(`/lists/${currentList._id}/items/${testItem._id}`)
          .send(updates)
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
      before('make the flawed PUT beforehand', (done) => {
        request.put(`/lists/${currentList._id}/items/${testItem._id}`)
          .set('Authorization', `Token ${otherAuthToken}`)
          .send(updates)
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
      request.post(`/lists/${currentList._id}/items`)
        .set('Authorization', `Token ${authToken}`)
        .send(testItem)
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE:', err);
          testItem = res.body;
          done();
        });
    });
    before('making GET request beforehand', (done) => {
      request.delete(`/lists/${currentList._id}/items/${testItem._id.toString()}`)
        .set('Authorization', `Token ${authToken}`)
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
    
  });
  describe('testing DELETE item by id errors', () => {
    let testItem = {
      name:     'Tammy', 
      content:  'Remember Bird Person'
    };
    before('make the POST beforehand', (done) => {
      request.post(`/lists/${currentList._id}/items`)
        .set('Authorization', `Token ${authToken}`)
        .send(testItem)
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE:', err);
          testItem = res.body;
          done();
        });
    });
    describe('failure if list is wrong', () => {
      before('making GET request beforehand', (done) => {
        request.delete(`/lists/12345/items/${testItem._id.toString()}`)
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
    describe('failure if item doesnt exist ', () => {
      before('making GET request beforehand', (done) => {
        request.delete(`/lists/${currentList._id}/items/12345`)
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
    describe('failure if no auth token provided', () => {
      before('making GET request beforehand', (done) => {
        request.delete(`/lists/${currentList._id}/items/${testItem._id.toString()}`)
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
    describe('failure if using wrong persons auth token', () => {
      before('making GET request beforehand', (done) => {
        request.delete(`/lists/${currentList._id}/items/${testItem._id.toString()}`)
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
