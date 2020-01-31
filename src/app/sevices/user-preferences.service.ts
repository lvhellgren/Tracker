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
