import { CollectionObject } from './collection-object.model';

export interface Store extends CollectionObject {
  name: string; 
  address: string;
}