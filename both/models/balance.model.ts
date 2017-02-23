import { CollectionObject } from './collection-object.model';

// should be in open status to allow close
export interface Balance extends CollectionObject {
  cashExistence: number;
  cashFlow?: number;
  operation: string; // open // close // extraction // deposit
  actionDate: string;
  orderIds?: string[];
  storeId: string;
}