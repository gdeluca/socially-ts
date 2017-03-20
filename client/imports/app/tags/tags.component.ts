// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Bert } from 'meteor/themeteorchef:bert';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from '../../modules/multiselect';

// model 
import { Tags, definedTags, tagsMapping } from '../../../../both/collections/tags.collection';
import { Tag } from '../../../../both/models/tag.model';
import { Dictionary } from '../../../../both/models/dictionary';


import template from './tags.component.html';
import style from './tags.component.scss';

@Component({
  selector: 'tags',
  template,
  styles: [ style ],
})
@InjectUser('currentUser')
export class TagsComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();
  
  filters: Subject<any> = new Subject<any>();


  collectionCount: number = 0;
  PAGESIZE: number = 2; 
  
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;
  tagsSub: Subscription;

  currentUser: Meteor.User;

  edited: Tag = {code:'', type:'', description:''};

  tags: Observable<Tag[]>;
  tagNames: Observable<Tag[]>;

  mapping = tagsMapping; // imported frm Tags;

  filtersParams: any = {
    'description':  ''
  };

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value': 'code'},
    {'key': 'Descripcion', 'value': 'name'},
  ];

  complexForm : FormGroup;

  commonTexts: IMultiSelectTexts = {
    checkAll: 'Todos',
    uncheckAll: 'Ninguno',
    checked: 'Selecionado',
    checkedPlural: 'Seleccionados',
    searchPlaceholder: 'Buscar...',
    defaultTitle: 'Sin seleccion',
    allSelected: 'Todos Selecionados',
  };

  singleSettings: IMultiSelectSettings = {
    pullRight: false,
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-secondary',
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: false,
    showCheckAll: false,
    showUncheckAll: false,
    dynamicTitleMaxItems: 1,
    maxHeight: '300px',
  };

  tagSelected: string[] = [];
  tagsData: IMultiSelectOption[] = [];
  
  constructor(
    private paginationService: PaginationService, 
    private formBuilder: FormBuilder
  ){
    this.complexForm = formBuilder.group({
      description: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
    });
  }

  ngOnInit() {
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.sortDirection,
      this.sortField,
      this.filters
    ).subscribe(([pageSize, curPage, sortDirection, sortField, filters]) => {
      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: {[sortField as string]: sortDirection as number }
      };

      this.paginationService.setCurrentPage(this.paginationService.defaultId(), curPage as number);           
        this.populateTable(this.tagSelected, options, filters);
      

    });

      if (this.tagsSub) {
        this.tagsSub.unsubscribe();
      }
      this.tagsSub = MeteorObservable.subscribe('tags')
      .subscribe(() => {
        this.tagNames = Tags.find({code: '00', description:"ACTIVE"}).zone();
        this.populateTagsData();
        this.tagSelected = ['section'];
      })
    

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
        this.collectionCount = 4 //Counts.get('numberOf'+this.tagSelected[0]);
        console.log('numberOf'+this.tagSelected[0], this.collectionCount);
        this.paginationService.setTotalItems(this.paginationService.defaultId(), this.collectionCount);
      
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('description');
    this.sortDirection.next(1);
    this.filters.next('');

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });

  }
  
  ngOnDestroy() {
    if (this.paginatedSub) {
      this.paginatedSub.unsubscribe();
    }
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
    this.tagsSub.unsubscribe();
  } 

  getMappedTagType(value){
    return this.mapping[value];
  }

  populateTagsData() {
    let result: IMultiSelectOption[] = [];
    this.tagNames.flatMap(function(tags) { return tags })
    .distinct()
    .subscribe((tag) => {
      result.push({id: tag.type, name: this.getMappedTagType(tag.type)});
    });
    this.tagsData = result;
  }

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  update = function(tag: Tag){
    MeteorObservable.call('updateTag', tag._id, tag.description)
    .subscribe(() => {
      Bert.alert('Se cambio la etiqueta: ' + tag.description , 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al actualizar:  ${error} ', 'danger', 'growl-top-right' ); 
    });
  }

  save(value: any){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    }

    if (this.complexForm.valid) {
      let values = this.complexForm.value;
      console.log('adding', this.tagSelected[0], value.description);
      MeteorObservable.call('addTag', this.tagSelected[0], value.description)
        .subscribe(() => {
          Bert.alert('Se agrego la etiqueta: ' + value.description , 'success', 'growl-top-right' ); 
      }, (error) => {
          Bert.alert('Error al agregar:  ${error} ', 'danger', 'growl-top-right' ); 
      });
    
      this.complexForm.reset();
    } 
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  search(field: string, value: string): void {
    console.log(value);
    if (this.filtersParams[field] === value) {
      return;
    }
    this.filtersParams[field] = value

    this.curPage.next(1);
    this.filters.next(this.filtersParams);
  }

  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

  populateTable(name, options, filters){
    if (name.length > 0) {
      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      
      this.paginatedSub = MeteorObservable.subscribe('tags.'+name[0])
      .subscribe(() => {
        this.tags = Tags.find({type: name[0], code: { $ne: '00' }}).zone();
        this.collectionCount = Counts.get('numberOf'+this.tagSelected[0]);
        console.log('numberOf'+this.tagSelected[0], this.collectionCount);
        this.paginationService.setTotalItems(this.paginationService.defaultId(), this.collectionCount);
      })  
    }
  }
  

}
