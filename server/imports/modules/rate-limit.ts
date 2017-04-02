
import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import * as _ from 'underscore';

export function loadRateLimitPolicies(){
  if (Meteor.isServer) { 
    for (let subscription in Meteor['default_server'].publish_handlers) {
      DDPRateLimiter.addRule({ 
        type: 'subscription', 
        name: subscription
      },25, 1000);
    }

    for (let method in Meteor['default_server'].method_handlers) {
      DDPRateLimiter.addRule({ 
        type: 'method',
        name: method
      },50, 1000);
    }
  }
}