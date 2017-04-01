import { Meteor } from 'meteor/meteor';

// import sample data 
import { loadData } from './imports/fixtures/data';


// load meteor publications
import './imports/publications/balances'; 
import './imports/publications/categories'; 
import './imports/publications/products'; 
import './imports/publications/purchases'; 
import './imports/publications/sales'; 
import './imports/publications/stocks'; 
import './imports/publications/stores'; 
import './imports/publications/tags'; 
import './imports/publications/users'; 

import { loadRateLimitPolicies } from './imports/modules/rate-limit';


// load meteor methods. e.g: to use latency compensation 
import '../both/methods/products.methods';

Meteor.startup(() => {
  loadData();
  loadRateLimitPolicies();
});