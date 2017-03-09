import { Observable } from 'rxjs/Observable';
import { Component } from "@angular/core";

import template from "./sale-details.component.html";
import style from "./sale-details.component.scss";

@Component({
  selector: "sale-details",
  template,
  styles: [ style ]
})
export class SaleDetailsComponent {
 
  products: any[];
  saleNumber: number;
  total: number;

  constructor() {
    this.total = 0;
    this.saleNumber = 234233243;
    this.products = [
      { 'code': '3453423',
        'name': 'Panalon Banbalina',
        'size': 'L',
        'brand': 'Marva',
        'model': 'Campana',
        'color': 'Azul',
        'price': 340,
        'quantity': 4,
        'available': 30
      },
      { 'code': '5435345',
        'name': 'Remera Mangas Larga algodon',
        'size': 'XXL',
        'brand': 'Vortex',
        'model': 'Bind',
        'color': 'Negra',
        'price': 123,
        'quantity': 1,
        'available': 3
      }
    ];
  }

  addProduct(code){
    // search the product by code and add it to the table 
  }
   
  increaseAmount(product) {
    if (product.available - product.quantity > 0) {
      product.quantity +=1;
    }
  }

  decreaseAmount(product) {
    if (product.quantity > 1) {
      product.quantity -=1;
    }
  }

  remove(product){

  }

  cancelSale(){}
}
