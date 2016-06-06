'use strict';

const expect        = require('chai').expect; 
const debug         = require('debug')('Create Accout Test: '); 
// const User          = require(`${__dirname}/../resources/user/user-model`);
const port          = process.env.API_PORT || 3000;
const server        = require(`${__dirname}/../server`);
const manageServer  = require(`${__dirname}/test-lib/manage-server`)(server, port);
const request       = require(`${__dirname}/test-lib/request`)(`localhost:${port}`);

describe('ENDPOINT: /new-account', () => {
  before((done) => {
    manageServer.checkIfServerRunningBeforeTests(done);
  });
  after((done) => {
    manageServer.closeServerAfterTests(done);
  });
  describe('testing POST', () => {
    before((done) => {
      request.post('/new-account')
        .send({ username: 'georgeWashington', password: 'oralHygiene' })
        .then((res) => {
          this.res = res;
          done();
        })
        .catch((err) => {
          debug(err);
          done();
        });
    });
    it('should return a user and authorization token', () => {
      expect(this.res.status).to.equal(200);
    });
    // it('should have saved the user to the database', () => {
    //   
    // });
  });
});
