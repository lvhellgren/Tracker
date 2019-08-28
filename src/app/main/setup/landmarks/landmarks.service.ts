import { Injectable } from '@angular/core';
import { ACCOUNT_LANDMARKS_COLL, LandmarkDoc } from './landmark/landmark.service';
import * as firebase from 'firebase';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class LandmarksService {
  private db;
  private landmarksRef;

  private landmarksSubject = new BehaviorSubject<LandmarkDoc[]>([]);
  public landmarks$: Observable<LandmarkDoc[]>;

  constructor(private afs: AngularFirestore) {
    this.db = firebase.firestore();
    this.landmarksRef = this.db.collection(ACCOUNT_LANDMARKS_COLL);
    this.landmarks$ = this.landmarksSubject.asObservable();
  }

  fetchLandmarks(accountId: string) {
    const landmarks$ = this.afs.collection(ACCOUNT_LANDMARKS_COLL, ref => ref.where('accountId', '==', accountId));
    landmarks$.valueChanges().subscribe((docs: any) => {
      const landmarkDocs: LandmarkDoc[] = [];
      docs.map((landmarkDoc: LandmarkDoc) => {
        landmarkDocs.push(landmarkDoc);
      });
      this.landmarksSubject.next(landmarkDocs);
    });
  }
}
