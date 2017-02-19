import { Meteor } from 'meteor/meteor';
import { Categories } from '../../../both/collections/categories.collection';

Meteor["publishComposite"]('categories', function() {
  return {
    find: function() {
      return Categories.find({ })
    }
  }
});