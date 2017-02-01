import { Component} from '@angular/core';

import template from './navbar.component.html';
import style from './navbar.component.scss';

@Component({
  selector: 'app-navbar',
  template,
  styles: [ style ],
})
export class NavbarComponent {
  isCollapsed: boolean = true;

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

}
