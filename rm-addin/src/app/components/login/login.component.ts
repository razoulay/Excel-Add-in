import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private router: Router, private formBuilder: FormBuilder) {
    console.log('Login component is created');
    this.processing = false;

    this.reactiveForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      isRemember: [false]
    });
  }

  ngOnInit() {
    console.log('LoginComponent initializing...');
  }

  authorize(): void {
    if (this.reactiveForm.valid) {
      console.log('authorize = ' + this.reactiveForm.value.username);
      this.loadingText = 'Authentication ...';
      this.processing = true;
    }
  }

  alertClosed(): void {
    this.isError = false;
  }
}
