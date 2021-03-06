import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DataService } from '../../services/data.service';
import { UserSession, UserAuth } from '../../models/userauth.model';
import { RestApiService } from '../../services/restapi.service';

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

  public reactiveForm: FormGroup;

  constructor(private router: Router, private formBuilder: FormBuilder, private dataService: DataService,
              private apiService: RestApiService) {
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

  authorize(event): void {
    if (this.reactiveForm.valid) {
      console.log(`authorize = ${this.reactiveForm.value.username}`);
      this.loadingText = 'Authentication ...';
      this.processing = true;
      const user = new UserAuth(this.reactiveForm.value.username, this.reactiveForm.value.password);

      this.apiService.authenticate(user).subscribe((result) => {
        console.log(`authenticate success: session_token = ${result.userToken}`);
        this.processing = false;
        if (result.userToken !== '') {
          this.dataService.setUserSession(result);
          this.router.navigate(['dashboard']);
        } else {
          this.errorMessage = 'Credentials are wrong';
          this.isError = true;
        }
      }, (err) => {
        console.log('authenticate failed');
        this.errorMessage = err.message;
        this.processing = false;
        this.isError = true;
      });

    }
  }

  alertClosed(): void {
    this.isError = false;
  }
}
