import { Component } from "@angular/core";
import template from "./app.component.html";
import style from "./app.component.scss";
import { Observable } from 'rxjs/Observable';

import { Bert } from 'meteor/themeteorchef:bert';


@Component({
  selector: "app",
  template,
  styles: [ style ]
})
export class AppComponent {
  constructor(
  ){
    Bert.defaults.hideDelay = 7000;
  }
}
