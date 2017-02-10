import { Products } from '../../../both/collections/products.collection';
import { Product } from '../../../both/models/product.model';
import { Category } from '../../../both/models/category.model';
import { Section } from '../../../both/models/section.model';

 
export function loadProducts() {
  if (Products.find().cursor.count() === 0) {
    // name, code, size, color, description, category

    const productList: Product[] = [
    {
      name: 'Remera Levis',
      code: 12398712398712,
      size: 'L',
      color: 'negro',
      description: '100% algodon.',
      category: {
        name: 'Remeras',
        section: {
          name: 'Ropa'
        }
      }
    },
    {
      name: 'Pantalon Friza',
      code: 12398712398734,
      size: '8',
      color: 'negro',
      description: 'algodon, friza',
      category: {
        name: 'Pantalon',
        section: {
          name: 'Ropa'
        }
      }
    },
    {
      name: 'Auto con baterias grande',
      code: 123987123398734,
      size: '',
      color: 'varios',
      description: 'Modelo Prasnavi grande',
      category: {
        name: 'Juguetes',
        section: {
          name: 'Juguetes'
        }
      }
    }
   ];

    productList.forEach((product: Product) => Products.insert(product));
  }
}