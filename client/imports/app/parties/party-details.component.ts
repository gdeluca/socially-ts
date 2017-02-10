// angular
import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';

import { Router, ActivatedRoute, CanActivate } from '@angular/router';
import { InjectUser } from "angular2-meteor-accounts-ui";

// reactive
import { Subscription } from 'rxjs/Subscription';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// models
import { Parties } from '../../../../both/collections/parties.collection';
import { Party } from '../../../../both/models/party.model';
import { Users } from '../../../../both/collections/users.collection';
import { User } from '../../../../both/models/user.model';
 
import template from './party-details.component.html';
import style from './party-details.component.scss';

   
@Component({
  selector: 'party-details',
  template,
  styles: [ style ],
})
@Injectable()
@InjectUser('user')
export class PartyDetailsComponent implements OnInit, OnDestroy {
  partyId: string;
  party: Party;
  paramsSub: Subscription;
  partySub: Subscription;
  users: Observable<User>;
  uninvitedSub: Subscription;
  replied: boolean = false;

  user: Meteor.User;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}
 
 
  ngOnInit() {
    /* zone retorns observable */ 
    console.log('init party details subscribers');
    this.paramsSub = this.activeRoute.params
      .map(params => params['partyId'])
      .subscribe(partyId => {
        this.partyId = partyId
        
        if (this.partySub) {
          console.log('unsuscribe party sub');
          this.partySub.unsubscribe();
        }

        this.partySub = MeteorObservable.subscribe('party', this.partyId).subscribe(() => {
          MeteorObservable.autorun().subscribe(() => {
            this.party = Parties.findOne(this.partyId);
            this.getUsers(this.party);
            this.hasRepliedInvitation();
          });
        });


        if (this.uninvitedSub) {
          console.log('unsuscribe uninvited sub');
          this.uninvitedSub.unsubscribe();
        }
 
        this.uninvitedSub = MeteorObservable.subscribe('uninvited', this.partyId).subscribe(() => {
          this.getUsers(this.party);
        });

      });
  }

  ngOnDestroy() {
    console.log('destroy party details subscribers');
    this.paramsSub.unsubscribe();
    this.partySub.unsubscribe();
    this.uninvitedSub.unsubscribe();
  }
 
  saveParty() {
    if (!Meteor.userId()) {
      alert('Please log in to change this party');
      return; 
    }

    Parties.update(this.party._id, {
      $set: {
        name: this.party.name,
        description: this.party.description,
        location: this.party.location,
        'public': this.party.public
      }
    });
 
    this.router.navigate(['']); 
  }

  invite(user: Meteor.User) {
    MeteorObservable.call('invite', this.party._id, user._id).subscribe(() => {
      alert('User successfully invited.');
    }, (error) => {
      alert(`Failed to invite due to ${error}`);
    });
  }

  getUsers(party: Party) {
    if (party) {
      this.users = Users.find({
        _id: {
          $nin: party.invited || [],
          $ne: Meteor.userId()
        }
      }).zone();
    }
  }

  reply(rsvp: string) {
    MeteorObservable.call('reply', this.party._id, rsvp).subscribe(() => {
      alert('You successfully replied.');
    }, (error) => {
      alert(`Failed to reply due to ${error}`);
    });
  }

  hasRepliedInvitation() {
    let userId = Meteor.userId(); 
    if (!userId || !this.party) {
      return false;
    }
    
    let rsvpIndex = this.party.rsvps ? this.party.rsvps.findIndex((rsvp) => rsvp.userId === userId) : -1;
    //console.log(rsvpIndex);

    this.replied = (rsvpIndex != -1);
  }

  // can be used before the subscription has finished, so we must check if the party property is available
  get isOwner(): boolean {
    return this.party && this.user && this.user._id === this.party.owner;
  }

  get isPublic(): boolean {
    return this.party && this.party.public;
  }
 
  get isInvited(): boolean {
    if (this.party && this.user) {
      const invited = this.party.invited || [];
 
      return invited.indexOf(this.user._id) !== -1;
    }
 
    return false;
  }

}