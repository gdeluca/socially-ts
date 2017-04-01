import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductSize } from '../models/product-size.model';

export const ProductSizes = new MongoObservable.Collection<ProductSize>('productSizes');
export const lettersSizes = {'S':'700','M':'701','L':'702','XL':'703','XXL':'704','XXXL':'705','XXXXL':'706'};
export const uniqueSize = {'UNICO':'699'};

export function getMappingSize(size: string){
  if (size) {
    if (lettersSizes[size.toUpperCase()]) {
      return lettersSizes[size.toUpperCase()];
    } else if (isNaN(+size)) { 
      return "talle-invalido";
    } else {
      return Array(3-size.length).join("0")+""+size; 
    }
  }
}

ProductSizes.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

ProductSizes.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});