import { CollectionObject } from './collection-object.model';

export interface Order extends CollectionObject {
  productDetailId: string[];
  total: number;
}