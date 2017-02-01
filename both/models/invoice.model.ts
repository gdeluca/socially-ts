import { ProductDetail } from './product-detail.model';

export interface Invoice {
  productDetails: ProductDetail[];
  total: number;
}