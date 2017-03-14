declare module 'meteor/themeteorchef:bert' {
   module Bert {
      function alert(message: string, type: string, style:string, icon?:string):void;
      function alert(options:any):void;
      const defaults:any;
  } 
}