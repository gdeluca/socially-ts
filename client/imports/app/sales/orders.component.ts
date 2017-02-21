import { Observable } from 'rxjs/Observable';
import { Component } from "@angular/core";

import template from "./orders.component.html";
import style from "./orders.component.scss";

@Component({
  selector: "orders",
  template,
  styles: [ style ]
})
export class OrdersComponent {
  
  orderCreated: boolean = false;
  orders: any[];

  constructor() {
    this.orders = [
      { 'orderNumber': '1000120',
        'total': '1210',
        'discount': '0',
        'status': 'Submited',
        'sellerName': 'Guille',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'orderNumber': '1000121',
        'total': '10',
        'discount': '0',
        'status': 'Submited',
        'sellerName': 'Marcelo',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'orderNumber': '1000122',
        'total': '21',
        'discount': '0',
        'status': 'Reserved',
        'sellerName': 'Guille',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'orderNumber': '1000123',
        'total': '450',
        'discount': '0',
        'status': 'Submited',
        'sellerName': 'Marcelo',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'orderNumber': '1000124',
        'total': '220',
        'discount': '0',
        'status': 'Submited',
        'sellerName': 'Guille',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'orderNumber': '1000125',
        'total': '410',
        'discount': '10',
        'status': 'Submited',
        'sellerName': 'Guille',
        'lastUpdate': '2017-01-14T10:13:01Z'
      }
    ];
  }

  addOrder(){
    this.orderCreated = true;
  }

  deleteOrder(){
    this.orderCreated = false;
  }

}
