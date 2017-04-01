import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductPrice } from '../models/product-price.model';

export const ProductPrices = new MongoObservable.Collection<ProductPrice>('productPrices');

ProductPrices.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

ProductPrices.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});