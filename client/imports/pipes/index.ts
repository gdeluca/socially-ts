import { DisplayNamePipe } from './display-name.pipe';
import {MapValuesPipe} from "./map-values.pipe";
import {MapToIterable} from "./map-to-iterable.pipe";
import {DisplayLeadingZerosPipe} from "./display-leading-zeros.pipe";



 
export const PIPES_DECLARATIONS: any[] = [
  DisplayNamePipe,
  MapValuesPipe,
  MapToIterable,
  DisplayLeadingZerosPipe,
];