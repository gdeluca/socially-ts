import { CollectionObject } from './collection-object.model';

export interface Product extends CollectionObject {
  name: string;
  code: number;
  size: string;
  color: string;
  brand: string;
  model: string;
  description: string;
  categoryId: string;
}