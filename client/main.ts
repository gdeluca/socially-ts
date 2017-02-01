import "angular2-meteor-polyfills";

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode } from "@angular/core";
import { Meteor } from "meteor/meteor";
import { AppModule } from "./imports/app";

//enableProdMode();

// load meteor methods. e.g: to use latency compensation 
import '../both/methods/parties.methods';

Meteor.startup(() => {
   platformBrowserDynamic().bootstrapModule(AppModule);
});
