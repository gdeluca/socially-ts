import { CollectionObject } from './collection-object.model';

export interface UserStore extends CollectionObject {
  userId: string; 
  storeId: string;
}