import { Component} from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(
    private router: Router
    ) {}

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    this.router.navigate(['/']);
    Meteor.logout();
  }

  getCurrentStoreName(){
    let val = Session.get("currentStoreName"); 
    return (val != null)?val:'';
  }

  getCurrentBalanceNumber(): number{
    let val = Session.get("currentBalanceNumber"); 
    return (val != null)?val:-1;
  }

  getCurrentBalanceStatus(): number{
    let val = Session.get("currentBalanceStatus"); 
    return (val != null)?val:'';
  }
  

  getCurrentUser(){
    let val = Session.get("currentUserEmail"); 
    return (val != null)?val:'';
  }

  isLoggedin(){
    if (Meteor.userId()){
      return true
    }
    return false;
  }
}
