import { CollectionObject } from './collection-object.model';

export interface Stock extends CollectionObject { //rename to Purchases
  buyPrice: number; //  pricePurchased
  buyDate: string; //   datePurchased
  buyAmount: number; // quantityPurchased amount keep tracks of bought merchandise, do not change over time
  active: boolean;  // remove this
  productId: string;
}