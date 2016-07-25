'use strict';

// set up env variable to only use a particular test database
const mongoose              = require('mongoose');
process.env.MONGOLAB_URI    = 'mongodb://localhost/todo_app_test';
const server                = require(`${__dirname}/../server`);
const port                  = process.env.API_PORT || 3000;

// Set up chai nd require other npm modules
const debug                 = require('debug')('todo:itemsRouterTest'); 
const chai                  = require('chai');
const chaiHttp              = require('chai-http');
const expect                = chai.expect; 
chai.use(chaiHttp);

// Require in my modules
const Item                  = require(`${__dirname}/../resources/item/item-model`);
const List                  = require(`${__dirname}/../resources/list/list-model`);
const User                  = require(`${__dirname}/../resources/user/user-model`);

// Require in testing utilites
const manageServer          = require(`${__dirname}/test-lib/manage-server`)(mongoose, server, port);
const authenticatedRequest  = require(`${__dirname}/test-lib/authenticated-request`)(chai.request, `localhost:${port}`);




// Variables to use in requests 
let currentUser     = {
  username:     'RickSanchez',
  password:     'MeeseeksUnity',
  email:        'WubbaLubbaDubDub@C137.com'
};
let request         = null;
let authToken       = null;

let currentList     = {
  name:         'Enemies',
  description:  'they messed up.'
};

describe('ENDPOINT: /lists/:listId/items', () => {
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
        if (err) debug('ERROR POSTING LIST BEFOREHAND: ', err);
        currentList = res.body;
        request     = authenticatedRequest('/lists', authToken);
        done();
      });
  });
  after('close server afterwards and drop database', (done) => {
    manageServer.closeServerAndDbAfterTests(done);
  });
  
  // ////////////////////////////////////////
  // POST /items
  // ////////////////////////////////////////
  describe('testing POST success', () => {
    this.postedItem = {
      name:     'Tammy', 
      content:  'Remember Bird Person'
    };
    before('make the POST beforehand', (done) => {
      request('post', done, { id: `${currentList._id}/items`, data: this.postedItem })
        .end((err, res) => {
          this.err = err;
          this.res = res;
          done();
        });
    });
    it('should have returned an item', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body.name).to.equal(this.postedItem.name);
      expect(this.res.body.content).to.equal(this.postedItem.content);
      expect(this.res.body).to.have.property('creationDate');
    });
    it('should have saved the item to the database', (done) => {
      Item.findById(this.res.body._id, (err, item) => {
        expect(err).to.equal(null);
        debug('item is: ', item);
        expect(item.name).to.equal(this.postedItem.name);
        done();
      });
    });
    it('should have saved a reference to the  item to its list', (done) => {
      List.findById(currentList._id, (err, list) => {
        debug('SAVED LIST:', list);
        expect(err).to.equal(null);
        let items = list.toObject().items;
        expect(items.some((itemId) => {
          return itemId.toString() === this.res.body._id;
        })).to.equal(true);
        done();
      });
    });
  });
  describe('testing POST errors', () => {
    // Leaving out auth based tests on items routes for now -- because lookup handled w/ get list beforehand, lists tests should be sufficient to prove these routes work the same way 
    // describe('it should error out without an auth token', () => {
    //   before('making POST request without auth token', (done) => {
    //     this.postedItem = {
    //       name:         'Prince Nebulon', 
    //       content:      'Hah.'
    //     };
    //     request.post(`/lists/${currentList._id}/items`)
    //       .send(this.postedItem)
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
    describe('it should error without a name included', () => {
      before('making POST request without auth token', (done) => {
        this.postedItem  = {
          content:     'Hah.'
        };
        request('post', done, { id: `${currentList._id}/items`, data: this.postedItem })
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
  });
  
  // ////////////////////////////////////////
  // GET /lists
  // ////////////////////////////////////////
  describe('testing GET all item success', () => {
    before('making item POST request beforehand', (done) => {
      this.postedItem = {
        name:         'Prince Nebulon',
        content:      'Hah.'
      };
      request('post', done, { id: `${currentList._id}/items`, data: this.postedItem })
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE GET:', err);
          this.postedItem = res;
          done();
        });
    });
    before('making GET request beforehand', (done) => {
      request('get', done, { id: `${currentList._id}/items` })
        .end((err, res) => {
          this.err = err;
          this.res = res;
          done();
        });
    });
    it('should have returned an item', () => {
      expect(this.err).to.equal(null);
      expect(this.res.status).to.equal(200);
      expect(this.res.body).to.not.be.empty;
    });
  });
  describe('testing GET all item errors', () => {
    let postedItem = null;
    before('making item POST request beforehand', (done) => {
      postedItem = {
        name:         'Beta 7',
        content:      'Unity picks losers...wait'
      };
      request('post', done, { id: `${currentList._id}/items`, data: postedItem })
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE GET:', err);
          postedItem = res;
          done();
        });
    });
    // Leaving out auth based tests on items routes for now -- because lookup handled w/ get list beforehand, lists tests should be sufficient to prove these routes work the same way
    // describe('it should error without an auth token', () => {
    //   before('making GET request beforehand', (done) => {
    //     request.get(`/lists/${currentList._id}/items`)
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
    describe('it should error if no such list exists', () => {
      before('making GET request beforehand', (done) => {
        request('get', done, { id: 'notARealId/items' })
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
  });
});
