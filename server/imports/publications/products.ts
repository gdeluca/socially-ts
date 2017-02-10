import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Products } from '../../../both/collections/products.collection';
import { SearchOptions } from '../../../both/search/search-options';

Meteor.publish('products', () => Products.find());

Meteor.publish('product', function(productId: string) {
  return Products.find(buildQuery.call(this, productId));
});
 
function buildQuery(productId?: string): Object { 
 return { _id: productId };
}