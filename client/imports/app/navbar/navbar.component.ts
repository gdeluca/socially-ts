import { Component} from '@angular/core';

import template from './navbar.component.html';
import style from './navbar.component.scss';

import {InjectUser} from "angular2-meteor-accounts-ui";


@Component({
  selector: 'app-navbar',
  template,
  styles: [ style ],
})
@InjectUser('user')
export class NavbarComponent {
  isCollapsed: boolean = true;

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

   logout() {
    Meteor.logout();
  }

}
