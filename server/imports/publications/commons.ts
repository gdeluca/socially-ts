

export function getSelectorFilter(filterFields:string[], filters: any) {
  let selectors: any[] = new Array();
  let result: any = {};

  for (let filter of filterFields) {
    if (filters[filter]){
      if (typeof filters[filter] === 'string') {
        selectors.push({ [filter]: { $regex: '.*' + (filters[filter] || '') + '.*', $options: '' }});
      }
      if (typeof filters[filter] === 'numeric') {
        
      }
    } 
  }
       

  // workarround: join doesn't wor 
  if (selectors.length > 0) {
    if (selectors.length == 1) {
      result = selectors[0];
    } else {
      result["$and"] = selectors;
    }
  }
  //result['and'] = selectors;
  //result = { $and: [ {"name":{$regex:".*v.*",$options:"i"}}, {"size":{"$regex":".*s.*",$options:"i"}} ] }
  // result = {"name":{"$regex":"*"}}
  return result;
}