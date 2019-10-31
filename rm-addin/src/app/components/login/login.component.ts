import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DataService } from '../../services/data.service';
import { UserSession } from '../../models/userauth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  public errorMessage: string;
  public isError: boolean;
  processing: boolean;
  loadingText: string;

  reactiveForm: FormGroup;

  constructor(private router: Router, private formBuilder: FormBuilder, private dataService: DataService) {
    console.log('Login component is created');
    this.processing = false;

    this.reactiveForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    console.log('LoginComponent initializing...');
  }

  authorize(): void {
    if (this.reactiveForm.valid) {
      console.log(`authorize = ${this.reactiveForm.value.username}`);
      this.loadingText = 'Authentication ...';
      this.processing = true;
      const userSession = new UserSession();
      userSession.userToken = 'aaaaaa';
      this.dataService.setUserSession(userSession);

      this.router.navigate(['dashboard']);
    }
  }

  alertClosed(): void {
    this.isError = false;
  }
}
