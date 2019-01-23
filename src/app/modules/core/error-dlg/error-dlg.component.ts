// Copyright (c) 2019 Lars Hellgren (lars@exelor.com).
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
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  template: `
    <div fxLayoutAlign="space-around" class="title" mat-dialog-title>Error</div>
    <div class="msg" mat-dialog-content>
      {{data.msg}}
    </div>
    <mat-dialog-actions fxLayoutAlign="space-around">
      <button mat-button [mat-dialog-close]="false" class="colors">OK</button>
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
  `]
})
export class ErrorDlgComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

}
