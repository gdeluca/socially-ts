import { Meteor } from 'meteor/meteor';
import {Injectable} from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';


import * as _ from 'underscore';

@Injectable()
export class SessionHelper {
   constructor(
     ) {}

    getSessionStoreName() { 
      let val = Session.get("currentStoreName"); 
      return (val != null) ? val : '';
    }

    setSessionStoreName(storeName: string) { 
       Session.setPersistent("currentStoreName", storeName);
    }

    getSessionStoreId() { 
      let val = Session.get("currentStoreId"); 
      return (val != null) ? val : '';
    }

    setSessionStoreId(storeId: string) { 
       Session.setPersistent("currentStoreId", storeId);
    }

    getBalanceNumber() { 
      let val = Session.get("currentBalanceNumber"); 
      return (val != null) ? val : -1;
    }

    setBalanceNumber(number: number) { 
       Session.setPersistent("currentBalanceNumber", number);
    }

    getBalanceStatus() { 
      let val = Session.get("currentBalanceStatus"); 
      return (val != null) ? val : '';
    }

    setBalanceStatus(status: string) { 
       Session.setPersistent("currentBalanceStatus", status);
    }

}