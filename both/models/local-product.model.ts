import { CollectionObject } from './collection-object.model';

export interface LocalProduct extends CollectionObject { // rename to stock
  amount: number; //quantityTrack keeps track of the stock
  priceCash: number;
  priceCard: number;
  rateCash: number; // percentage
  rateCard: number; // percentage
  active: boolean;
  localId: string; 
  stockId: string;
}