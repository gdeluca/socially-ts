import { Pipe, PipeTransform } from '@angular/core';
  
@Pipe({
  name: 'leadingZeros'
})
export class DisplayLeadingZerosPipe implements PipeTransform {
  
  transform(number: number, length: number): string {
    if (!number || !length || length < 1 || length > 15) {
      return '';
    }

    return Array(length - String(number).length +1)
      .join("0") + number; 
  }
  
  
}