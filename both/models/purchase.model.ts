import { CollectionObject } from './collection-object.model';

export interface Purchase extends CollectionObject {
  purchaseNumber: string;
  date: string;
  total?:number;
  provider:string;
  payment:number;
  productPurchaseIds?: string[];
}