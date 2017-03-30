import { CollectionObject } from './collection-object.model';

export interface Purchase extends CollectionObject {
  purchaseNumber: number;
  purchaseState: string; // SELECTION // VERIFICATION // CANCELED 
  createdAt: Date;
  lastUpdate: Date;
  total?:number;
  provider:string;
  paymentAmount:number;
}