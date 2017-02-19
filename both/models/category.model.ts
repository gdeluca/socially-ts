import { CollectionObject } from './collection-object.model';

export interface Category extends CollectionObject {
  name: string; 
  sectionId: string; 
}