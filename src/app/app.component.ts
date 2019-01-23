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

import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isSignedIn = true;
  drawerType: string;

  @Output() accountClick: EventEmitter<string> = new EventEmitter();

  @ViewChild('appdrawer') private appdrawer: any;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {
    // Register the 'Sign In with Google' icon with MathIconRegistry
    this.matIconRegistry.addSvgIcon(
      'google_sign_in',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/btn_google_dark_normal_ios.svg')
    );
  }

  drawerToggle(type: string) {
    if (this.appdrawer._opened && this.drawerType === type) {
      this.appdrawer.toggle();
    } else if (type) {
      if (type === 'nav') {
        this.appdrawer.position = 'start';
        this.appdrawer.mode = 'over';
      } else if (type === 'help') {
        this.appdrawer.position = 'start';
        this.appdrawer.mode = 'side';
      } else if (type === 'prefs') {
        this.appdrawer.position = 'start';
        this.appdrawer.mode = 'side';
      }

      this.drawerType = type;
      this.appdrawer.open();
    }
  }
}
