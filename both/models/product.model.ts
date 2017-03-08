import { CollectionObject } from './collection-object.model';

export interface Product extends CollectionObject {
  code:string;
  name: string;
  color: string;
  brand?: string;
  model?: string;
  provider: string;
  categoryId: string;
}