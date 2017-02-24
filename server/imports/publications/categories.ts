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

Meteor.publishComposite('categories.sections', function(options: SearchOptions) {
  return {
    find: function() {
    Counts.publish(this, 'numberOfCategories',Categories.collection.find({}, options), { noReady: true });
    return Categories.find({}, options);
    },
    children: [{
      find: function(category) {
        return Sections.find({_id: category.sectionId});
      }
    }]
  }
});