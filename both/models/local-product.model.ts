import { CollectionObject } from './collection-object.model';

export interface LocalProduct extends CollectionObject {
  amount: number;
  priceCash: number;
  priceCard: number;
  rateCash: number;
  rateCard: number;
  active: boolean;
  localId: string; 
  stockId: string;
}