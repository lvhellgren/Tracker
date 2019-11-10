// Copyright (c) 2019 Lars Hellgren.
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

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { Router } from '@angular/router';

export const MENU_NAMES: Map<string, string> = new Map([
  ['blank', 'Simulator'],
  ['device-events', 'Device Events'],
  ['events-list', 'Events'],
  ['move-event', 'MOVE Event'],
  ['move-event-add', 'Add MOVE Event'],
]);

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit {
  panelName: string;
  headerTitle: string;

  constructor(private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
  }

  onActivate($event) {
    if ($event) {
      const childPath = this.router.url.split('/')[2];
      this.panelName = this.getMenuName(childPath);
      this.headerTitle = this.getMenuName(childPath);
    }
  }

  getMenuName(key: string) {
    if (key === '') {
      return '';
    }
    return MENU_NAMES.get(key);
  }
}
