import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductSale } from '../models/product-sale.model';

export const ProductSales = new MongoObservable.Collection<ProductSale>('productSales');

ProductSales.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

ProductSales.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});