import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../../services/data.service';
import { UserSession } from '../../models/userauth.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  public errorMessage: string;
  public isError: boolean;
  processing: boolean;
  loadingText: string;

  constructor(private router: Router, private dataService: DataService) {
    console.log('DashboardComponent is created');
  }

  ngOnInit() {
    console.log('DashboardComponent initializing...');
  }

  alertClosed(): void {
    this.isError = false;
  }
}
