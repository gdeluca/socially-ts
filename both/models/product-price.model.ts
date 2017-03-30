import { CollectionObject } from './collection-object.model';

export interface ProductPrice extends CollectionObject {
  lastCostPrice: number;
  createdAt: Date;
  priceCash: number;
  priceCard: number;
  rateCash?: number;
  rateCard?: number;
  productId:string;
  storeId: string;
  active: boolean;
}