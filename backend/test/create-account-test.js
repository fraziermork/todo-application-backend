'use strict';

// set up env variable to only use a particular test database
const mongoose      = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_app_test';

const chai          = require('chai');
const chaiHttp      = require('chai-http');
chai.use(chaiHttp);
const request       = chai.request;
const expect        = chai.expect; 
const debug         = require('debug')('newAccountRouterTest'); 
const User          = require(`${__dirname}/../resources/user/user-model`);
const port          = process.env.API_PORT || 3000;
const server        = require(`${__dirname}/../server`);
const manageServer  = require(`${__dirname}/test-lib/manage-server`)(server, port);
// const request       = require(`${__dirname}/test-lib/request`)(`localhost:${port}`);

describe('ENDPOINT: /new-account', () => {
  before('open server before block', (done) => {
    debug('before block');
    manageServer.checkIfServerRunningBeforeTests(done);
  });
  
  after('close server afterwards', (done) => {
    debug('after block');
    manageServer.closeServerAfterTests(done);
  });
  
  after('drop test database afterwards', (done) => {
    debug('dropping test db');
    mongoose.connection.db.dropDatabase(() => {
      debug('dropped test db');
      done();
    });
  });
  
  // working before block 
  // before('open server beforehand', (done) => {
  //   debug('before block');
  //   if (!server.isRunning) {
  //     return server.listen(port, () => {
  //       debug('server listen callback');
  //       server.isRunning = true;
  //       done();
  //     });
  //   } 
  //   done();
  // });
  
  // working after block 
  // after('close server afterwards', (done) => {
  //   debug('after block');
  //   if (server.isRunning) {
  //     return server.close(() => {
  //       debug('server closed');
  //       server.isRunning = false;
  //       done();
  //     });
  //   }
  //   return done();
  // });
  
  it('should be able to test', () => {
    debug('newAccountRouterTest expect true to equal true');
    expect(true).to.equal(true);
  });
  
  it('should be able to POST a user', (done) => {
    debug('newAccountRouterTest making request');
    request('localhost:3000').post('/new-account')
      .send({ 
        username: 'georgeWashington2', 
        password: 'oralHygiene2', 
        email:    'cherrytree2@whitehouse.gov' 
      })
      .end((err, res) => {
        debug('newAccountRouterTest request callback');
        // console.log('RESPONSE BODY', res.body);
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        done();
      });
  });
  
  
  describe('testing POST success', () => {
    before('make POST request beforehand', (done) => {
      debug('newAccountRouterTest making request');
      request('localhost:3000').post('/new-account')
        .send({ 
          username: 'georgeWashington', 
          password: 'oralHygiene', 
          email:    'cherrytree@whitehouse.gov' 
        })
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
      expect(this.res.body.user.username).to.equal('georgeWashington');
      expect(this.res.body.user.email).to.equal('cherrytree@whitehouse.gov');
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
      before('make POST request beforehand', (done) => {
        debug('newAccountRouterTest making request');
        request('localhost:3000').post('/new-account')
          .send({ 
            username: 'georgeWashington', 
            password: 'oralHygiene', 
            email:    'cherrytree@whitehouse.gov' 
          })
          .end((err, res) => {
            debug('newAccountRouterTest request callback');
            this.err = err;
            this.res = res;
            done();
          });
      });
      it('should return a user an an authorization token', () => {
        expect(this.err).to.not.equal(null);
        expect(this.res.status).to.equal(400);
      });
      
      
    });
    // describe('failure on invalid information provided', () => {
    //   before()
    //   
    //   
    // });
  });
  
});














// describe('ENDPOINT: /new-account', () => {
//   // before('open server before block', function(done){
//   //   debug('test before block');
//   //   manageServer.checkIfServerRunningBeforeTests.call(this, done);
//   // });
//   // after('close server after block', function(done) {
//   //   debug('test after block', server.isRunning);
//   //   // manageServer.closeServerAfterTests.call(this, done);
//   //   server.close(() => {
//   //     server.isRunning = false;
//   //     debug('closed');
//   //     done();
//   //   });
//   // });
//   
//   before((done) => {
//     if (!server.isRunning) {
//       server.listen(port, function() {
//         debug('server.listen');
//         server.isRunning = true;
//         done();
//       });
//       return;
//     }
//     done();
//   });
// 
//   after((done) => {
//     if (server.isRunning) {
//       server.close(function() {
//         debug('server.close');
//         server.isRunning = false;
//         done();
//       });
//       return;
//     }
//     done();
//   }); 
//   
//   describe('testing POST', () => {
//     before('POST request before', function(done) {
//       debug('POST request before');
//       request.post('/new-account')
//         .send({ 
//           username: 'georgeWashington', 
//           password: 'oralHygiene', 
//           email:    'cherrytree@whitehouse.gov' 
//         })
//         .then((res) => {
//           debug('inside test then callback');
//           this.res = res;
//           done();
//         })
//         .catch((err) => {
//           debug(err);
//           done();
//         });
//     });
//     it('should return a user and authorization token', () => {
      // expect(this.res.status).to.equal(200);
      // expect(this.res.body.user.username).to.equal('georgeWashington');
      // expect(this.res.body.user.email).to.equal('cherrytree@whitehouse.gov');
      // expect(this.res.body.user).to.have.property('creationDate');
      // expect(this.res.body).to.have.property('token');
//     });
//     // it('should have saved the user to the database', () => {
//     // });
//   });
// });
