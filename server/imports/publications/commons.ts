

export function getSelectorFilter(filterFields:string[], filters: any) {
  let selectors: any[] = new Array();
  let result: any = {};

  for (let filter of filterFields) {
    
    if (filterFields.indexOf(filter) > -1 && filters[filter]) {
      if (typeof filters[filter] === 'string') {
        selectors.push({ [filter]: { $regex: '.*' + (filters[filter] || '') + '.*', $options: 'i' }});
      }
      if (typeof filters[filter] === 'numeric') {
        
      }
    } 
  }

  // workarround: join doesn't work 
  if (selectors.length > 0) {
    if (selectors.length == 1) {
      result = selectors[0];
    } else if (selectors.length == 2) {
       result =  { $and: [  selectors[0], selectors[1] ] };
    } else if (selectors.length == 3) {
       result =  { $and: [  selectors[0], selectors[1], selectors[2] ] };
    }
  }
  //result = { $and: [ {"name":{$regex:".*v.*",$options:"i"}}, {"size":{"$regex":".*s.*",$options:"i"}} ] }
 // result = {"name":{"$regex":"*"}}

  return result;
}