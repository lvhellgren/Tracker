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

import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

const md = '960px';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isSignedIn = true;
  drawerType: string;
  smallView: boolean;
  expand: boolean;

  @Output() accountClick: EventEmitter<string> = new EventEmitter();

  @ViewChild('appdrawer') private appdrawer: any;

  private breakpointSubscription: Subscription;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private breakpointObserver: BreakpointObserver) {
    // Register the 'Sign In with Google' markerIconForm with MathIconRegistry
    this.matIconRegistry.addSvgIcon(
      'google_sign_in',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/devices/btn_google_dark_normal_ios.svg')
    );
  }

  ngOnInit() {
    this.breakpointSubscription = this.breakpointObserver
      .observe([`(min-width: ${md}`])
      .subscribe((state: BreakpointState) => {
        this.smallView = !state.matches;
      });
  }

  ngOnDestroy() {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

  drawerToggle(type: string) {
    if (this.appdrawer._opened && this.drawerType === type) {
      this.appdrawer.toggle();
    } else if (type) {
      if (type === 'nav') {
        this.appdrawer.position = 'start';
        this.appdrawer.mode = 'over';
        this.expand = false;
      } else if (type === 'help') {
        this.appdrawer.position = 'start';
        this.appdrawer.mode = 'side';
        this.expand = this.smallView;
      } else if (type === 'prefs') {
        this.appdrawer.position = 'start';
        this.appdrawer.mode = 'side';
        this.expand = this.smallView;
      }

      this.drawerType = type;
      this.appdrawer.open();
    }
  }
}
