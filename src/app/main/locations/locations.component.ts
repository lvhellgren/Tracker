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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { GlobalService } from '../../sevices/global';
import { UnitService } from './unit.service';

// const sm = '600px';
const md = '960px';

// const lg = '1280px';

@Component({
  selector: 'app-locations',
  template: '<router-outlet></router-outlet>',
  providers: [
    UnitService
  ]
})

export class LocationsComponent implements OnInit, OnDestroy {
  private breakpointSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private breakpointObserver: BreakpointObserver,
              private global: GlobalService) {
  }

  ngOnInit() {
    this.breakpointSubscription = this.breakpointObserver
      .observe([`(min-width: ${md}`])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.global.currentWidth = 'lg';
        } else {
          this.global.currentWidth = 'sm';
        }
        this.router.navigate([`./${this.global.currentWidth}`], {relativeTo: this.route});
      });
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
