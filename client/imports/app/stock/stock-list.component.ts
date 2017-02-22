import { Observable } from 'rxjs/Observable';
import { Component } from "@angular/core";

import template from "./stock-list.component.html";
import style from "./stock-list.component.scss";

@Component({
  selector: "stock-list",
  template,
  styles: [ style ]
})
export class StockListComponent {
  
  orderCreated: boolean = false;
  stocks: any[];
  locals: any[];
  localProducts: any[];
  product: any;
  
  constructor() {
    this.locals = [
      { "_id" : "01", "name" : "El Molino", "address" : "25 de mayo 1690" },
      { "_id" : "02", "name" : "Pumpu Store", "address" : "colon 1460" }
    ];

    this.localProducts = [
      { "_id" : "01", "priceCash" : 350, "priceCard" : 400, "rateCash" : 100, "rateCard" : 110, "active" : true, "localId" : "01", "stockId" : "01", "amount" : 35 },
      { "_id" : "02", "priceCash" : 350, "priceCard" : 400, "rateCash" : 100, "rateCard" : 110, "active" : true, "localId" : "02", "stockId" : "01", "amount" : 25 },
    ];
    
    this.product = { "_id" : "01", 
      "name" : "Levis Straus", 
      "code" : 100001, 
      "size" : "L", 
      "color" : "Negro", 
      "brand" : "Levis", 
      "model" : "Top 4y", 
      "description" : "Calidad Levis", 
      "categoryId" : "06" };


    this.stocks = [
      { "_id" : "01", 
      "buyPrice" : 150, 
      "buyDate" : "2016-07-12T11:23:01Z", 
      "buyAmount" : 50, 
      "active" : true, 
      "productId" : "01" }
    ];
  }

}
