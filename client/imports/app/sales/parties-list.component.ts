// angular
import { Component, OnInit, OnDestroy, Injectable, Inject } from '@angular/core';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';

import { Counts } from 'meteor/tmeasday:publish-counts';

// model 
import { Parties } from '../../../../both/collections/parties.collection';
import { Party } from '../../../../both/models/party.model';
import { SearchOptions } from '../../../../both/search/search-options';
 
import template from './parties-list.component.html';
import style from './parties-list.component.scss';

@Component({
  selector: 'parties-list',
  template,
  styles: [ style ],
})
@InjectUser('user')
export class PartiesListComponent implements OnInit, OnDestroy {
  parties: Observable<Party[]>;
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  nameOrder: Subject<number> = new Subject<number>();
  partiesSize: number = 0;
  PAGESIZE: number = 3; 
  
  partiesSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  location: Subject<string> = new Subject<string>();
  user: Meteor.User;


  constructor(
    private paginationService: PaginationService
  ) {}
 
   ngOnInit() {

    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.nameOrder,
      this.location
    ).subscribe(([pageSize, curPage, nameOrder, location]) => {
      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { name: nameOrder as number }
      };
      
      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.partiesSub) {
        this.partiesSub.unsubscribe();
      }
      
      this.partiesSub = MeteorObservable.subscribe('parties', options, location)
      .subscribe(() => {
        this.parties = Parties.find({}, {
          sort: {
            name: nameOrder
          }
        }).zone();
      });
      
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.nameOrder.next(1);
    this.location.next('');

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.partiesSize = Counts.get('numberOfParties');
      this.paginationService.setTotalItems(this.paginationService.defaultId(), this.partiesSize);
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: 30,
    });

  }
  
  removeParty(party: Party): void {
    Parties.remove(party._id);
  }

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  search(value: string): void {
    this.curPage.next(1);
    this.location.next(value);
  }
  
  changeSortOrder(nameOrder: string): void {
    this.nameOrder.next(parseInt(nameOrder));
  }

  isOwner(party: Party): boolean {
    return this.user && this.user._id === party.owner;
  }
  
  ngOnDestroy() {
    this.partiesSub.unsubscribe();
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
  } 

}