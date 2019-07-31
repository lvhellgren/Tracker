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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { UiService } from '../ui-service/ui.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit, OnDestroy {
  msg: string;
  isLoading = false;
  signInForm: FormGroup;
  authMsgSubscription: Subscription;
  loadingSubscription: Subscription;

  userIdValidators = [
    Validators.required,
    Validators.email
  ];

  passwordValidators = [
    Validators.required,
    Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9!@#$%^&* ]+)$'),
    Validators.minLength(6),
    Validators.maxLength(25)
  ];

  constructor(
    private authService: AuthService,
    private uiService: UiService) {
  }

  ngOnInit() {
    this.authService.signOut();
    this.signInForm = new FormGroup({
      userId: new FormControl('', {
        validators: this.userIdValidators
      }),
      password: new FormControl('', {
        validators: this.passwordValidators
      })
    });

    this.authMsgSubscription = this.authService.authMsg.subscribe(msg => {
      this.msg = msg;
    });

    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(isLoading => {
      this.isLoading = isLoading;
    });
  }

  ngOnDestroy(): void {
    if (this.authMsgSubscription) {
      this.authMsgSubscription.unsubscribe();
    }

    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

  onEmailSignInClick() {
    this.msg = null;
    this.authService.emailSignIn(this.signInForm.value.userId, this.signInForm.value.password);
  }

  onGoogleSignInClick() {
    this.msg = null;
    this.authService.googleSignIn();
  }

  isInputValid() {
    return this.signInForm.valid;
  }

  isUserIdValid() {
    const id: string = this.signInForm.value.userId;
    return id && id.length > 0;
  }

  onResetPasswordClick() {
    this.signInForm.get('password').clearValidators();
    this.signInForm.get('password').updateValueAndValidity();
    this.authService.resetPassword(this.signInForm.value.userId);
  }
}
