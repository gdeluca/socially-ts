import { Meteor } from 'meteor/meteor';
import { Categories } from '../../../both/collections/categories.collection';
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

Meteor.publishComposite('categories', function() {
  return {
    find: function() {
      return Categories.find({});
    }
  }
});

Meteor.publishComposite('categories.sections', function(options: SearchOptions, filterField?: string, filterValue?: string) {
  let query = {}
  
  if (filterField && filterValue) {
    const searchRegEx = { '$regex': '.*' + ([filterValue] || '') + '.*', '$options': 'i' };
    query = { [filterField]: searchRegEx }
  }
  return {
    find: function() {
    Counts.publish(this, 'numberOfCategories',Categories.collection.find(query , options), { noReady: true });
    return Categories.find(query, options);
    },
    children: [{
      find: function(category) {
        return Sections.find({_id: category.sectionId});
      }
    }]
  }
});