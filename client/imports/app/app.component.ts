import { Component } from "@angular/core";
import template from "./app.component.html";
import style from "./app.component.scss";
import { Observable } from 'rxjs/Observable';

import { Parties } from '../../../both/collections/parties.collection';

import { Party } from '../../../both/models/party.model';


@Component({
  selector: "app",
  template,
  styles: [ style ]
})
export class AppComponent {
  
}
