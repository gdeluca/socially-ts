import { Observable } from 'rxjs/Observable';
import { Component } from "@angular/core";

import template from "./sales.component.html";
import style from "./sales.component.scss";

@Component({
  selector: "sales",
  template,
  styles: [ style ]
})
export class SalesComponent {
  
  saleCreated: boolean = false;
  sales: any[];

  constructor() {
    this.sales = [
      { 'saleNumber': '1000120',
        'total': '1210',
        'discount': '0',
        'status': 'Submited',
        'sellerName': 'Guille',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'saleNumber': '1000121',
        'total': '10',
        'discount': '0',
        'status': 'Submited',
        'sellerName': 'Marcelo',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'saleNumber': '1000122',
        'total': '21',
        'discount': '0',
        'status': 'Reserved',
        'sellerName': 'Guille',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'saleNumber': '1000123',
        'total': '450',
        'discount': '0',
        'status': 'Submited',
        'sellerName': 'Marcelo',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'saleNumber': '1000124',
        'total': '220',
        'discount': '0',
        'status': 'Submited',
        'sellerName': 'Guille',
        'lastUpdate': '2017-01-14T10:13:01Z'
      },
      { 'saleNumber': '1000125',
        'total': '410',
        'discount': '10',
        'status': 'Submited',
        'sellerName': 'Guille',
        'lastUpdate': '2017-01-14T10:13:01Z'
      }
    ];
  }

  addSale(){
    this.saleCreated = true;
  }

  deleteSale(){
    this.saleCreated = false;
  }

}
