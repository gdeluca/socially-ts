import { CollectionObject } from './collection-object.model';

export interface Purchase extends CollectionObject {
  purchaseNumber: number;
  price: number;
  date: string;
  quantity: number;
  productId: string;
}