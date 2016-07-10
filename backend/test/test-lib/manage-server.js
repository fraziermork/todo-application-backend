'use strict';

const debug     = require('debug')('todo:manageServer');
module.exports  = returnManageServer;

/**
 * returnManageServer - Module to provide methods for before and after to start and close the server
 *  
 * @param  {object}   server the server that is listening  
 * @param  {object}   port   the port that the server should be listening on 
 * @return {object}          the module object that contains the before and after methods
 */ 
function returnManageServer(mongoose, server, port) {
  const manageServer = {
    /**    
     * checkIfServerRunningBeforeTests - checks if it needs to start the server or not
     *      
     * @param  {function} done tell mocha it's done         
     */     
    checkIfServerRunningBeforeTests(done) {
      debug('checkIfServerRunningBeforeTests');
      if (!server.isRunning) {
        debug('server was not running');
        return server.listen(port, () => {
          debug(`Server listening on ${port}`);
          server.isRunning = true;
          return done();
        });
      } 
      debug('server was running, calling done');
      return done();
    },
    
    
    /**    
     * closeServerAndDbAfterTests - checks if it needs to close the server and tells mongoose to drop the database
     *      
     * @param  {function} done tell mocha it's done              
     */     
    closeServerAndDbAfterTests(done) {
      debug('closeServerAfterTests');
      if (server.isRunning) {
        return server.close(() => {
          debug('Server closed');
          server.isRunning = false;
          mongoose.connection.db.dropDatabase(() => {
            debug('dropped test db');
            return done();
          });
        });
      }
      mongoose.connection.db.dropDatabase(() => {
        debug('dropped test db');
        return done();
      });
    }
  };
  
  return manageServer;
}
