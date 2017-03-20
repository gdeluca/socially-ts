import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { SearchOptions } from '../../../both/search/search-options';
import { Tags } from '../../../both/collections/tags.collection';
import { getSelectorFilter } from './commons';


Meteor.publish('tags', function() {
  return Tags.find({code: '00', description:"ACTIVE"});
});

Meteor.publish('tags.name', function(options: SearchOptions = {limit:0,skip:0}, filters: any = {}) {
  let filterSelector = getSelectorFilter(['name'], filters);
  let selector = { $and: [ {type: 'name'},{code: { $ne: '00' }},filterSelector ] };
  Counts.publish(this, 'numberOfname', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
}); 

Meteor.publish('tags.model', function(options: SearchOptions = {limit:0,skip:0}, filters: any = {}) {
  let filterSelector = getSelectorFilter(['model'], filters);
  let selector = { $and: [ {type: 'model'},{code: { $ne: '00' }},filterSelector ] };
  Counts.publish(this, 'numberOfmodel', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.brand', function(options: SearchOptions = {limit:0,skip:0}, filters: any = {}) {
  let filterSelector = getSelectorFilter(['brand'], filters);
  let selector = { $and: [ {type: 'brand'},{code: { $ne: '00' }},filterSelector ] };
  Counts.publish(this, 'numberOfbrand', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.color', function(options: SearchOptions = {limit:0,skip:0}, filters: any = {}) {
  let filterSelector = getSelectorFilter(['color'], filters);
  let selector = { $and: [ {type: 'color'},{code: { $ne: '00' }},filterSelector ] };
  Counts.publish(this, 'numberOfcolor', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.size', function(options: SearchOptions = {limit:0,skip:0}, filters: any = {}) {
  let filterSelector = getSelectorFilter(['size'], filters);
  let selector = { $and: [ {type: 'size'},{code: { $ne: '00' }},filterSelector ] };
  Counts.publish(this, 'numberOfsize', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.provider', function(options: SearchOptions = {limit:0,skip:0}, filters: any = {}) {
  let filterSelector = getSelectorFilter(['provider'], filters);
  let selector = { $and: [ {type: 'provider'}, {code: { $ne: '00' }}, filterSelector ]};
  Counts.publish(this, 'numberOfprovider', Tags.collection.find(selector, options), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.section', function(options: SearchOptions = {limit:0,skip:0}, filters: any = {}) {
  let filterSelector = getSelectorFilter(['section'], filters);
  let selector = { $and: [ {type: 'section'}, {code: { $ne: '00' }}, filterSelector ]};
  Counts.publish(this, 'numberOfsection', Tags.collection.find(selector, options), { noReady: true });
  return Tags.find(selector, options);
});
