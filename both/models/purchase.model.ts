import { CollectionObject } from './collection-object.model';

export interface Purchase extends CollectionObject {
  purchaseNumber: string;
  purchaseState: string; //'loaded','requested','received','canceled', 'deleted'
  purchaseDate: string;
  lastUpdate: string;
  total?:number;
  provider:string;
  paymentAmount:number;
}