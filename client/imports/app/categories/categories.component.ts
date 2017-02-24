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

import { Categories } from '../../../../both/collections/categories.collection';
import { Sections } from '../../../../both/collections/sections.collection';
import { Category } from '../../../../both/models/category.model';
import { Section } from '../../../../both/models/section.model';

 
import template from './categories.component.html';
import style from './categories.component.scss';

@Component({
  selector: 'categories',
  template,
  styles: [ style ],
})
@InjectUser('user')
export class CategoriesComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  nameOrder: Subject<number> = new Subject<number>();
  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  compositeSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  location: Subject<string> = new Subject<string>();
  user: Meteor.User;
  // categories: Category[];
  // sections: Section[];
  newCategory: Category = {sectionId:'', name:''};
  adding: boolean = false;
  editing: boolean = false;
  selected: any;
  categories: Observable<Category[]>;
  sections: Observable<Section[]>;

  constructor(
    private paginationService: PaginationService
  ) {
    // this.categories = [
    //   { "_id" : "01", "name" : "Shorts", "sectionId" : "01" },
    //   { "_id" : "02", "name" : "Panatalon Largo", "sectionId" : "01" },
    //   { "_id" : "03", "name" : "Pantalon Corto", "sectionId" : "01" },
    //   { "_id" : "04", "name" : "Calza", "sectionId" : "01" },
    //   { "_id" : "05", "name" : "Pollera", "sectionId" : "02" },
    //   { "_id" : "06", "name" : "Remera Mangas Corta", "sectionId" : "03" },
    //   { "_id" : "07", "name" : "Remera Mangas Larga", "sectionId" : "03" },
    //   { "_id" : "08", "name" : "Camisa", "sectionId" : "03" },
    //   { "_id" : "09", "name" : "Blusa", "sectionId" : "03" },
    //   { "_id" : "10", "name" : "Musculosa", "sectionId" : "03" },
    //   { "_id" : "11", "name" : "Pupera", "sectionId" : "03" },
    //   { "_id" : "12", "name" : "Saco Sport", "sectionId" : "04" },
    //   { "_id" : "13", "name" : "Rompeviento", "sectionId" : "05" },
    //   { "_id" : "14", "name" : "Chupin", "sectionId" : "01" },
    // ];

    // this.sections = [
    //   { "_id" : "01", "name" : "Pantalon" },
    //   { "_id" : "02", "name" : "Vestido" },
    //   { "_id" : "03", "name" : "Remera" },
    //   { "_id" : "04", "name" : "Saco" },
    //   { "_id" : "05", "name" : "Campera" },
    // ];
  }

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

      if (this.compositeSub) {
        this.compositeSub.unsubscribe();
      }
      this.compositeSub = MeteorObservable.subscribe('categories.sections', options)
        .subscribe(() => {
          this.categories = Categories.find({}).zone();
          this.sections = Sections.find({}).zone();
      });
      
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.nameOrder.next(1);
    this.location.next('');

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfCategories');
      this.paginationService.setTotalItems(this.paginationService.defaultId(), this.collectionCount);
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: 30,
    });

  }
  
  ngOnDestroy() {
    this.compositeSub.unsubscribe();
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
  } 

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  saveCategory = function(){

  }

   customTrackBy(index: number, obj: any): any {
    return index;
  }

  // removeParty(party: Party): void {
  //   Parties.remove(party._id);
  // }

  // search(value: string): void {
  //   this.curPage.next(1);
  //   this.location.next(value);
  // }
  
  // changeSortOrder(nameOrder: string): void {
  //   this.nameOrder.next(parseInt(nameOrder));
  // }

  // isOwner(party: Party): boolean {
  //   return this.user && this.user._id === party.owner;
  // }
}