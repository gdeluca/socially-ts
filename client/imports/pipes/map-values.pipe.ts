import {Pipe, PipeTransform} from '@angular/core';
 
@Pipe({
  name: 'mapvalues'
})
export class MapValuesPipe implements PipeTransform {
  transform(key: string, map: any): string {
    
    return map[key];
  }
}