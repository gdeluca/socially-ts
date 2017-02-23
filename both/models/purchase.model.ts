import { CollectionObject } from './collection-object.model';

export interface Purchase extends CollectionObject {
  price: number;
  date: string;
  quantity: number;
  productId: string;
}