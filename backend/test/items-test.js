'use strict';

// DEBUG=manageServer,SERVER,listCtrl,AppError,errMidware,itemsRouterTest,itemsRouter,itemCtrl,tokenAuthMidware,getListMidware,getItemMidware

// set up env variable to only use a particular test database
const mongoose      = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_app_test';
const server        = require(`${__dirname}/../server`);
const port          = process.env.API_PORT || 3000;

const debug         = require('debug')('itemsRouterTest'); 
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
  
  // ////////////////////////////////////////
  // POST /items
  // ////////////////////////////////////////
  describe('testing POST success', () => {
    let testItem = {
      name:     'Tammy', 
      content:  'Remember Bird Person'
    };
    before('make the POST beforehand', (done) => {
      request.post(`/lists/${currentList._id}/items`)
      .set('Authorization', `Token ${authToken}`)
      .send(testItem)
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
      expect(this.res.body).to.have.property('creationDate');
      expect(this.res.body.list).to.equal(currentList._id);
    });
    it('should have saved the item to the database', (done) => {
      Item.findById(this.res.body._id, (err, item) => {
        expect(err).to.equal(null);
        expect(item.name).to.equal(testItem.name);
        done();
      });
    });
    it('should have saved the item to the list', (done) => {
      List.findById(currentList._id.toString(), (err, list) => {
        expect(list.items.length).to.equal(1);
        expect(list.items[0].toString()).to.equal(this.res.body._id);
        done();
      });
    });
  });
  describe('testing POST errors', () => {
    describe('it should error out without an auth token', () => {
      before('making POST request without auth token', (done) => {
        this.postedItem = {
          name:         'Prince Nebulon', 
          content:      'Hah.'
        };
        request.post(`/lists/${currentList._id}/items`)
          .send(this.postedItem)
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
      before('making POST request without auth token', (done) => {
        this.postedItem = {
          content:     'Hah.'
        };
        request.post(`/lists/${currentList._id}/items`)
          .set('Authorization', `Token ${authToken}`)
          .send(this.postedItem)
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
      request.post(`/lists/${currentList._id}/items`)
        .set('Authorization', `Token ${authToken}`)
        .send(this.postedItem)
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE GET:', err);
          this.postedItem = res;
          done();
        });
    });
    before('making GET request beforehand', (done) => {
      request.get(`/lists/${currentList._id}/items`)
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
      expect(this.res.body.name).to.equal(this.postedItem.name);
      expect(this.res.body.content).to.equal(this.postedItem.content);
      expect(this.res.body._id).to.equal(this.postedItem._id);
    });
  });
  describe('testing GET all item errors', () => {
    let postedItem = null;
    before('making item POST request beforehand', (done) => {
      postedItem = {
        name:         'Beta 7',
        content:      'Unity picks losers...wait'
      };
      request.post(`/lists/${currentList._id}/items`)
        .set('Authorization', `Token ${authToken}`)
        .send(postedItem)
        .end((err, res) => {
          if (err) debug('ERROR POSTING ITEM BEFORE GET:', err);
          postedItem = res;
          done();
        });
    });
    describe('it should error without an auth token', () => {
      before('making GET request beforehand', (done) => {
        request.get(`/lists/${currentList._id}/items`)
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
    describe('it should error if no such list exists', () => {
      before('making GET request beforehand', (done) => {
        request.get('/lists/12345/items')
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
  });
});
