import { CollectionObject } from './collection-object.model';

export interface Stock extends CollectionObject {
  quantity: number;
  priceCash: number;
  priceCard: number;
  rateCash: number; // percentage
  rateCard: number; // percentage
  active: boolean;
  storeId: string; 
  productSizeId: string;
}