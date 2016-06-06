'use strict';

const debug = require('debug')('Manage Server:');

module.exports = returnManageServer;

/**
 * returnManageServer - Module to provide methods for before and after to start and close the server
 *  
 * @param  {type} server the server that is listening  
 * @param  {type} port   the port that the server should be listening on 
 * @return {object}      an object that contains the before and after methods
 */ 
function returnManageServer(server, port) {
  console.log('SERVER IS', server);
  return {
    checkIfServerRunningBeforeTests(done) {
      if (!server.isRunning) {
        return server.listen(port, () => {
          debug(`Server listening on ${port}`);
          server.isRunning = true;
          return done();
        });
      } 
      return done();
    },
    closeServerAfterTests(done) {
      if (server.isRunning) {
        return server.close(() => {
          debug('Server closed');
          server.isRunning = false;
          return done();
        });
      }
      return done();
    }
  };
}
