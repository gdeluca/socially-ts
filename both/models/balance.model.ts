
import { CollectionObject } from './collection-object.model';

// should be in open status to allow close
export interface Balance extends CollectionObject {
  balanceNumber: string;
  cashExistence: number;
  cashFlow?: number;
  operation: string; // OPEN // CLOSE // EXTRACTION // DEPOSIT
  actionDate: string;
  saleIds?: string[];
  storeId: string;
}