import { Product } from './product.model';

export interface ProductDetail {
  product: Product; 
  quntity: number;
  subTotal: number;
}