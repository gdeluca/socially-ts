import { Products } from '../../../both/collections/products.collection';
import { Categories } from '../../../both/collections/categories.collection';
import { Sections } from '../../../both/collections/sections.collection';

import { Product } from '../../../both/models/product.model';
import { Category } from '../../../both/models/category.model';
import { Section } from '../../../both/models/section.model';


export function loadData() {
  if (Products.find().cursor.count() === 0) {

    Sections.insert({
      name:'Ropa'
    }).subscribe((sectionId) => {
      if (typeof sectionId === 'object') {
        console.log('error inserting:' + sectionId);
      } else {
        Categories.insert({
          name: 'Remeras',
          sectionId: sectionId
        }).subscribe((categoryId) => {
          if (typeof categoryId === 'object') {
            console.log('error inserting:' + sectionId);
          } else {
            Products.insert({
              name: 'Remera Levis',
              code: 12398712398712,
              size: 'L',
              color: 'negro',
              description: '100% algodon.',
              categoryId: categoryId
            });
          }  
        });
      }

      // ----------------
      Categories.insert({
          name: 'Pantalon',
          sectionId: sectionId
        }).subscribe((categoryId) => {
          if (typeof categoryId === 'object') {
            console.log('error inserting:' + categoryId);
          } else {
            Products.insert({
              name: 'Pantalon Friza',
              code: 7567567567,
              size: '8',
              color: 'negro',
              description: 'algodon, friza',
              categoryId: categoryId
            });
          }  
        });
    })

    // ----------------
    Sections.insert({
      name:'Juguetes'
    }).subscribe((sectionId) => {
      if (typeof sectionId === 'object') {
        console.log('error inserting:' + sectionId);
      } else {
        Categories.insert({
          name: 'Juguetes',
          sectionId: sectionId
        }).subscribe((categoryId) => {
          if (typeof categoryId === 'object') {
            console.log('error inserting:' + categoryId);
          } else {
            Products.insert({
              name: 'Auto con baterias grande',
              code: 2342343,
              size: '', 
              color: 'varios',
              description: 'Modelo Prasnavi grande',
              categoryId: categoryId
            });
          }  
        });
      }
    })
  }
}