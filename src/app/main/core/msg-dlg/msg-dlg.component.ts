import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-msg-dlg',
  template: `
      <div fxLayoutAlign="space-around" class="title" mat-dialog-title>{{data.title}}</div>
      <div class="msg" mat-dialog-content>
          {{data.msg}}
      </div>
      <a href="#"></a>
      <mat-dialog-actions fxLayoutAlign="space-around">
          <button mat-button [mat-dialog-close]="true" class="colors">{{data.ok}}</button>
      </mat-dialog-actions>`,
  styles: [`
      .title {
          font-size: large;
          color: gray;
      }

      .msg {
          font-size: medium;
          color: gray;
      }

      .colors {
          color: white;
          background-color: #3f51b5;
      }

      button {
          flex-basis: 80px;
          border-radius: .25rem;
      }

      .mat-dialog-actions {
          margin: 20px 0 0 0;
      }
  `]
})
export class MsgDlgComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
