
import { CollectionObject } from './collection-object.model';

// should be in open status to allow close
export interface Balance extends CollectionObject {
  balanceNumber: string;
  cashExistence: number;
  cashFlow?: number;
  operation: string; // open // close // extraction // deposit
  actionDate: string;
  saleIds?: string[];
  storeId: string;
}