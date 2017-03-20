import { CollectionObject } from './collection-object.model';

export interface Purchase extends CollectionObject {
  purchaseNumber: string;
  purchaseState: string; // LOADED // REQUESTED // RECEIVED //CANCELLED
  purchaseDate: string;
  lastUpdate: string;
  total?:number;
  provider:string;
  paymentAmount:number;
}