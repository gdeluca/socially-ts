import {Meteor} from 'meteor/meteor';
import {check, Match} from 'meteor/check';
import { SearchOptions } from './search-options';
import { Filter, Filters } from './filter';
import * as _ from 'underscore';


export function getSelectorFilter(
  filterFields:string[] = [], 
  filters: Filters = [], 
  otherFilter?: any
) {
  check(filterFields, [String]);
  check(filters, Match.Any);
  check(otherFilter, Match.Maybe(Match.Any));
  let selectors: any[] = [];

  for (let filterKey of filterFields) {
    let filter = _.find(filters, function(filter){ return filter.key == filterKey })
    if (filter  &&  filter.value){
      if (filter.key.indexOf(":") !== -1) {
        filter.key = filter.key.split(":")[1];
      }
      if (typeof filter.value === 'string') {
        selectors.push({ [filter.key]: { $regex: '.*' + (filter.value || '') + '.*', $options: '' }});
      }
      if (typeof filter.value === 'numeric') {
        
      }
    } 
  }
  
  if (!_.isEmpty(otherFilter)) {
    if (otherFilter instanceof Array) {
      selectors = selectors.concat(otherFilter)
    } else {
      selectors.push(otherFilter);
    }
  }
  
  let result: any = {};
  if (selectors.length > 0) {
    if (selectors.length == 1) {
      result = selectors[0];
    } else {
      result["$and"] = selectors;
    }
  }

  return result;
}

export function checkOptions(options: SearchOptions){
  check(
    options, Match.Optional(
      Match.ObjectIncluding(
        {
          fields: Match.Optional(Match.OneOf(Object, undefined)),
          sort: Match.Optional(Match.OneOf(Object, Array, undefined)),
          limit: Match.Optional(Match.OneOf(Number, undefined)),
          skip: Match.Optional(Match.OneOf(Number, undefined))
        }
      )
    )
  )
}