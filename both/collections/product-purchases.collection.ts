import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductPurchase } from '../models/product-purchase.model';

export const ProductPurchases = new MongoObservable.Collection<ProductPurchase>('productPurchases');

ProductPurchases.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

ProductPurchases.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});