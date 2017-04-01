import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';
import {check} from 'meteor/check';

import { getSelectorFilter, checkOptions } from './commons';
import { SearchOptions } from '../../../both/domain/search-options';
import { Filter, Filters } from '../../../both/domain/filter';

import { Categories } from '../../../both/collections/categories.collection';
import { Tags } from '../../../both/collections/tags.collection';

const categoryFields = ['name'];
const sectionFields = ['section:name'];

Meteor.publishComposite('categories', function() {
  return {
    find: function() {
      return Categories.collection.find({});
    } 
  }
}); 

Meteor.publishComposite('categories.sections', function(
  options: SearchOptions, 
  filters: Filters
) {  
    let categoryFilter = getSelectorFilter(categoryFields, filters);
    let sectionFilter = getSelectorFilter(sectionFields, filters);
    checkOptions(options);
    return {
      find: function() {
        Counts.publish(this, 'numberOfCategories', 
          Categories.collection.find(categoryFilter, options), { noReady: true });
        return Categories.collection.find(categoryFilter, options);
      },
      children: [
        {
          find: function(category) {
            let selector: any = {};
            selector["$and"] = [];
            selector["$and"].push({type: 'section'});
            selector["$and"].push({code: { $ne: '00' }});
            selector["$and"].push({_id: category.sectionId});
            selector["$and"].push(sectionFilter);
            return Tags.collection.find(selector, options);
          }
        }
      ]
    }
  }
);