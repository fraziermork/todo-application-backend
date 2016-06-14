// REQUIRE NPM MODULES
require('angular');
require('angular-route');
require('bluebird');


// REQUIRE CSS
require(`${__dirname}/css/base.css`);

// REQUIRE SERVICES
require(`${__dirname}/services/services-main.js`);
require(`${__dirname}/services/api-request.js`);
require(`${__dirname}/services/authentication.js`);
// require(`${__dirname}/services/reroute-check.js`);

// REQUIRE COMPONENTS
// require(`${__dirname}/components/item/item-controller.js`);
// require(`${__dirname}/components/item/item-directive.js`);

// require(`${__dirname}/components/list/list-controller.js`);
// require(`${__dirname}/components/list/list-directive.js`);

require(`${__dirname}/components/entry/entry-controller.js`);

// require(`${__dirname}/components/all/all-controller.js`);

// REQUIRE MAIN APP 
require(`${__dirname}/main/main-controller.js`);
