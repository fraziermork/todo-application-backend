'use strict';

const debug = require('debug')('todo:userCreate');

module.exports = returnUserCreate;

/**
 * returnUserCreate - posts and creates users beforehand for tests
 *  
 * @param  {object} request the request object  
 * @param  {object} User    the mognoose User model   
 * @return {object}         the module with methods attached 
 */ 
function returnUserCreate(request, User) {
  const userCreate = {
    /**    
     * postUserBefore - makes a POST request before a test, used in the create-account tests, must be used w/ .call(this, args) or apply
     *      
     * @param  {object}   userObject           the object containing the post body
     * @param  {function} done                 the mocha done function        
     */     
    postUserBefore(userObject, done) {
      debug('userCreate postUserBefore');
      request.post('/new-account')
        .send(userObject)
        .end((err, res) => {
          this.err = err;
          this.res = res;
          return done();
        });
    }
  };
  
  return userCreate;
}
