import { Meteor } from 'meteor/meteor';
import { Sections } from '../../../both/collections/sections.collection';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../both/search/search-options';


Meteor.publishComposite('sections', function() {
  return {
    find: function() {
      return Sections.find({});
    }
  }
});

Meteor.publishComposite('sections.with.counter', function(options: SearchOptions, filterField?: string, filterValue?: string) {
  let query = {}
  
  if (filterField && filterValue) {
    const searchRegEx = { '$regex': '.*' + ([filterValue] || '') + '.*', '$options': 'i' };
    query = { [filterField]: searchRegEx }
  }
  return {
    find: function() {
    Counts.publish(this, 'numberOfSections',Sections.collection.find(query , options), { noReady: true });
    return Sections.find(query, options);
    }
  }
});