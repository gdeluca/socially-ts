import { Meteor } from 'meteor/meteor';

// import sample data 
import { loadParties } from './imports/fixtures/parties';
import { loadData } from './imports/fixtures/data';


// load meteor publications
import './imports/publications/parties';

import './imports/publications/categories'; 
import './imports/publications/counters'; 
import './imports/publications/products'; 
import './imports/publications/sections'; 
import './imports/publications/stores'; 
import './imports/publications/stocks'; 
import './imports/publications/tags'; 
import './imports/publications/users'; 



// load meteor methods. e.g: to use latency compensation 
import '../both/methods/parties.methods';
import '../both/methods/products.methods';

Meteor.startup(() => {
  loadParties();
  loadData();
});