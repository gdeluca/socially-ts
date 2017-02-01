import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Parties } from '../../../both/collections/parties.collection';
import { SearchOptions } from '../../../both/search/search-options';


Meteor.publish('parties', function(options: SearchOptions, location?: string) {
 
  const selector = buildQuery.call(this, null, location);
  Counts.publish(this, 'numberOfParties', Parties.collection.find(selector), { noReady: true });
 
  return Parties.find(selector, options);
});

Meteor.publish('party', function(partyId: string) {
  return Parties.find(buildQuery.call(this, partyId));
});
 
function buildQuery(partyId?: string, location?: string): Object {
  const isAvailable = {
    $or: [{
      // party is public
      public: true
    },
    // or
    { 
      // those who are owners
      $and: [
      { owner: this.userId }, 
      { owner: { $exists: true } }
      ]
    },

    // those who has been invited
    {
      $and: [
        { invited: this.userId },
        { invited: { $exists: true } }
      ]
    }]
  };
 
  if (partyId) {
    return {
      // only single party
      $and: [{
          _id: partyId
        },
        isAvailable
      ]
    };
  }

  // match ignore case
  const searchRegEx = { '$regex': '.*' + (location || '') + '.*', '$options': 'i' };
 
  return {
    $and: [{
        location: searchRegEx
      },
      isAvailable
    ]
  };
 
}