
export class Container  {
  value: any[]; 

  constructor(value: any[]) {
    this.value = value;
  }

  add(value: any){
    this.value.push(value);
  }

}