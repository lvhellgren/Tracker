// Copyright (c) 2020 Lars Hellgren.
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


import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth/auth.guard';
import { NgModule } from '@angular/core';
import { SimulatorComponent } from './simulator.component';
import { BlankComponent } from './blank/blank.component';
import { EventsComponent } from './events/events.component';
import { MoveEventComponent } from './events/move-event/move-event.component';


const routes: Routes = [
  {
    path: 'simulator',
    component: SimulatorComponent,
    children: [
      {
        path: '',
        redirectTo: '/simulator/events-list',
        pathMatch: 'full',
        canActivate: [AuthGuard]
      },
      {
        path: 'blank',
        component: BlankComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'events-list',
        component: EventsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'move-event-add',
        component: MoveEventComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'move-event',
        component: MoveEventComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'move-event/:id',
        component: MoveEventComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class SimulatorRoutingModule {
}
