// angular
import { Component, OnInit, OnDestroy, Injectable, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/combineLatest';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/search/search-options';

// model 
import { Sections } from '../../../../both/collections/sections.collection';
import { Section } from '../../../../both/models/section.model';
import { Dictionary } from '../../../../both/models/dictionary';

import template from "./balance-resume.component.html";
import style from "./balance-resume.component.scss";

@Component({
  selector: "balance-resume",
  template,
  styles: [ style ]
})
export class BalanceResumeComponent {
  
  showOperations: boolean = false;
  showStores: boolean = false;

   
  balances: any[];

  constructor() {
    this.balances = [
      { "_id" : "01", "balanceNumber" : 2100001, "storeId" : "01", "cashExistence" : 500, "operation" : "close", "actionDate" : "2017-01-10T19:23:01Z", "facturation": 3440 },
      { "_id" : "03", "balanceNumber" : 2100003, "storeId" : "01", "cashExistence" : 1500, "operation" : "open", "actionDate" : "2017-01-12T9:11:01Z", "facturation": 3440 },
      { "_id" : "02", "balanceNumber" : 2100002, "storeId" : "01", "cashExistence" : 500, "operation" : "open", "actionDate" : "2017-01-12T9:11:01Z", "facturation": 3440 },
      { "_id" : "04", "balanceNumber" : 2100005, "storeId" : "01", "cashExistence" : 400, "cashFlow" : 50, "operation" : "deposit", "actionDate" : "2017-01-14T10:13:01Z", "facturation": 3440 },
    ];
  }

  doShowOperation(condition:boolean){
    this.showOperations = condition;
  }
  
  doShowStores(condition:boolean){
    this.showStores = condition;
  }


}
