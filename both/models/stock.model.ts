import { CollectionObject } from './collection-object.model';

export interface Stock extends CollectionObject {
  buyPrice: number;
  buyDate: string;
  stockCount: number;
  productId: string;
  active: boolean;
}