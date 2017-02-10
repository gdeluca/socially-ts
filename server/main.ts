import { Meteor } from 'meteor/meteor';

// import sample data 
import { loadParties } from './imports/fixtures/parties';
import { loadProducts } from './imports/fixtures/products';


// load meteor publications
import './imports/publications/parties'; 
import './imports/publications/users'; 
import './imports/publications/products'; 


// load meteor methods. e.g: to use latency compensation 
import '../both/methods/parties.methods';
import '../both/methods/products.methods';

Meteor.startup(() => {
  loadParties();
  loadProducts();
});