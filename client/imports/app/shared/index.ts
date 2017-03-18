import { DisplayNamePipe } from './display-name.pipe';
import {RsvpPipe} from "./rsvp.pipe";
import {MapValuesPipe} from "./map-values.pipe";
import {MapToIterable} from "./map-to-iterable.pipe";


 
export const SHARED_DECLARATIONS: any[] = [
  DisplayNamePipe,
  RsvpPipe,
  MapValuesPipe,
  MapToIterable,
];