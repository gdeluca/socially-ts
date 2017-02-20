import { CollectionObject } from './collection-object.model';

export interface Stock extends CollectionObject {
  buyPrice: number;
  buyDate: string;
  buyAmount: number; // amount keep tracks of bought merchandise, do not change over time
  active: boolean;
  productId: string;
}