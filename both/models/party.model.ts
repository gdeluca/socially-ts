import { CollectionObject } from './collection-object.model';
import { Rsvp } from './rsvp.model';

export interface Party extends CollectionObject {
  name: string;
  description: string;
  location: string;
  owner?: string; 
  public: boolean;
  invited?: string[];
  rsvps?: Rsvp[];
}