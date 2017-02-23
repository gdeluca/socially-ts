import { Meteor } from 'meteor/meteor';

// import sample data 
import { loadParties } from './imports/fixtures/parties';
import { loadData } from './imports/fixtures/data';


// load meteor publications
import './imports/publications/parties'; 
import './imports/publications/users'; 
import './imports/publications/stores'; 
import './imports/publications/products'; 
import './imports/publications/categories'; 


// load meteor methods. e.g: to use latency compensation 
import '../both/methods/parties.methods';
import '../both/methods/products.methods';

Meteor.startup(() => {
  loadParties();
  loadData();
});