// Copyright (c) 2020 Lars Hellgren (lars@exelor.com).
// All rights reserved.
//
// This code is licensed under the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions :
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Injectable, OnDestroy } from '@angular/core';
import { AuthService } from '../main/core/auth/auth.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

export const USER_PREFERENCES = 'user-preferences';
export const DEFAULT_PAGE_SIZE = 10;

export interface UserPreferences {
  email?: string;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService implements OnDestroy {
  private readonly userSubscription: Subscription;
  private userPreferencesSubscription: Subscription;

  private userPreferencesSubject: BehaviorSubject<UserPreferences> = new BehaviorSubject<UserPreferences>({});
  public userPreferences$ = this.userPreferencesSubject.asObservable();

  constructor(private authService: AuthService,
              private firestore: AngularFirestore) {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.fetchUserPreferences(user.email);
    });
  }

  ngOnDestroy() {
    if (!!this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (!!this.userPreferencesSubscription) {
      this.userPreferencesSubscription.unsubscribe();
    }
  }

  fetchUserPreferences(email: string) {
    this.userPreferencesSubscription = this.firestore.collection<UserPreferences>(USER_PREFERENCES,
        ref => ref.where('email', '==', email))
      .valueChanges()
      .subscribe(list => {
        if (list.length > 0) {
          this.userPreferencesSubject.next(list[0]);
        }
      });
  }

  saveUserPreference(name: string, value: any) {
    this.firestore.collection<UserPreferences>(USER_PREFERENCES).doc(this.authService.getUserId()).update({[name]: value});
  }
}
