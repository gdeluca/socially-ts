import { Meteor } from 'meteor/meteor';

// import sample data 
import { loadParties } from './imports/fixtures/parties';

// load meteor publications
import './imports/publications/parties'; 
import './imports/publications/users'; 


// load meteor methods. e.g: to use latency compensation 
import '../both/methods/parties.methods';


Meteor.startup(() => {
  loadParties();
});