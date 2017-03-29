// import {Meteor} from 'meteor/meteor';
// import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
// import * as _ from 'underscore';

// const THROTTLE_METHODS = _.chain(Meteor.default_server.method_handlers)
//   .keys()
//   .filter(k=> k.includes('.methods.'))
//   .value();
// DDPRateLimiter.addRule({
//   name(name) {
//     return _.contains(THROTTLE_METHODS, name);
//   },
//   // Rate limit per connection ID
//   connectionId() { return true; },
// }, 5, 1000);

// Meteor.methods({
 
//  dosAttack(type: string): string { 
//     console.log('dos attack');
//     return 'ping';
//  }
 
// });



// var preventDosAttack= {
//   userId: function() {return true;},
//   type: 'method',
//   name: 'dosAttack'
// }

// DDPRateLimiter.addRule(preventDosAttack, 5, 1000);

// Define a rule that matches login attempts by non-admin users
// var loginRule = {
//   userId: function (userId) {
//     return Meteor.users.findOne(userId).type !== 'Admin';
//   },
//   type: 'method',
//   name: 'login'
// }
// // Add the rule, allowing up to 5 messages every 1000 milliseconds.
// DDPRateLimiter.addRule(loginRule, 5, 1000);


