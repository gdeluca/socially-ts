import { Observable } from 'rxjs/Observable';
import { Component } from "@angular/core";

import template from "./stock-form.component.html";
import style from "./stock-form.component.scss";

@Component({
  selector: "stock-form",
  template,
  styles: [ style ]
})
export class StockFormComponent {
  
  constructor() {
  }

}
