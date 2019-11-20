import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../../services/data.service';
import { OfficehelperService } from '../../services/officehelper.service';
import { RestApiService } from '../../services/restapi.service';

import { Order } from '../../models/order.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  public allowUpdateOrders: boolean;
  public userToken: string;
  public errorMessage: string;
  public isError: boolean;
  processing: boolean;
  loadingText: string;

  constructor(private router: Router, private dataService: DataService, private officeHelper: OfficehelperService,
              private apiService: RestApiService) {
    console.log('DashboardComponent is created');
  }

  ngOnInit() {
    console.log('DashboardComponent initializing...');
    const userSession = this.dataService.getUserSession();
    if (userSession !== null && userSession !== undefined) {
      this.allowUpdateOrders = userSession.allowUpdateOrders;
      this.userToken = userSession.userToken;
      if (!this.allowUpdateOrders) {
        this.officeHelper.newTradeSheet().subscribe((result: boolean) => {
          console.log('newTradeSheet successfully');
        },
        (err) => {
          console.log('newTradeSheet failed');
        });
      }
    }
  }

  logout() {
    console.log('DashboardComponent: logout from current user');
    this.dataService.clearUserSession();
    this.router.navigate(['authentication']);
  }

  myOrders() {
    const self = this;
    self.loadingText = 'Loading My Orders ...';
    self.processing = true;
    this.apiService.getMyOrders(this.userToken).subscribe((apiResponse) => {
      console.log(`getMyOrders success: result = ${JSON.stringify(apiResponse)}`);
      if (!apiResponse.success) {
        self.errorMessage = apiResponse.error;
        self.processing = false;
        self.isError = true;
      } else {
        try {
          this.officeHelper.createMyOrdersSheet(apiResponse.headers, apiResponse.rows).subscribe((result: boolean) => {
            console.log('createMyOrdersSheet successfully');
            self.processing = false;
          },
          (err) => {
            console.log('createMyOrdersSheet failed');
            self.errorMessage = err.message;
            self.processing = false;
            self.isError = true;
          },
          () => {
            self.processing = false;
          });
        } catch (e) {
          self.errorMessage = e.message;
          self.processing = false;
          self.isError = true;
        }
      }
    }, (err) => {
      console.log('addOrder failed');
      this.errorMessage = err.message;
      this.processing = false;
      this.isError = true;
    });
  }

  rmOrders() {
    const self = this;
    self.loadingText = 'Loading RM Orders ...';
    self.processing = true;
    this.apiService.getRMOrders().subscribe((apiResponse) => {
      console.log(`getRMOrders success: result = ${JSON.stringify(apiResponse)}`);
      if (!apiResponse.success) {
        self.errorMessage = apiResponse.error;
        self.processing = false;
        self.isError = true;
      } else {
        try {
          this.officeHelper.createRMOrdersSheet(apiResponse.headers, apiResponse.rows).subscribe((result: boolean) => {
            console.log('createRMOrdersSheet successfully');
            self.processing = false;
          },
          (err) => {
            console.log('createRMOrdersSheet failed');
            self.errorMessage = err.message;
            self.processing = false;
            self.isError = true;
          },
          () => {
            self.processing = false;
          });
        } catch (e) {
          self.errorMessage = e.message;
          self.processing = false;
          self.isError = true;
        }
      }
    }, (err) => {
      console.log('addOrder failed');
      this.errorMessage = err.message;
      this.processing = false;
      this.isError = true;
    });
  }

  newTrade() {
    this.officeHelper.newTradeSheet().subscribe((result: boolean) => {
      console.log('newTradeSheet successfully');
    },
    (err) => {
      console.log('newTradeSheet failed');
    });
  }

  sendTrade() {
    const self = this;
    this.officeHelper.checkNewTrade().subscribe((success: boolean) => {
      if (!success) {
        this.errorMessage = 'The sum of numbers entered in first column of table should ' +
          'not exceed the number entered in the first row of the worksheet';
        this.isError = true;
      } else {
        this.officeHelper.getNewTradeData().subscribe((values: any) => {
          console.log('newTradeSheet successfully');

          if (values !== null) {
            self.loadingText = 'Sending trades ...';
            self.processing = true;

            const orderId = self.dataService.create_UUID();
            let receivedResults = 0;
            let totalResults = values.length;
            for (let index = 0; index < values.length; index++) {
              const orderData = values[index];
              const order = new Order();
              order.user_token = self.userToken;
              order.account = orderData[0];
              order.amount_ordered = orderData[1];
              order.instructions = orderData[2];
              order.order_id = orderId;
              order.status = 'NOT EXECUTED';

              if (order.account === null || order.account === undefined || order.account === '') {
                totalResults--;
                continue;
              }

              this.apiService.addOrder(order).subscribe((result) => {
                console.log(`addOrder success: result = ${JSON.stringify(result)}`);
                receivedResults++;
                if (receivedResults >= totalResults) {
                  this.processing = false;
                  if (result.success !== true) {
                    this.errorMessage = result.error;
                    this.isError = true;
                  }
                }
              }, (err) => {
                console.log('addOrder failed');
                this.errorMessage = err.message;
                this.processing = false;
                this.isError = true;
              });
            }
          }
        },
        (err) => {
          console.log('newTradeSheet failed');
        });
      }
    },
    (err) => {
      console.log('checkNewTrade failed');
    });
  }

  updateOrder() {

  }

  deleteOrder() {
    const self = this;
    this.officeHelper.getSelectedOrderId().subscribe((success: string) => {
      console.log(`getSelectedOrderId returned: ${success}`);
      if (success !== '') {
        self.loadingText = 'Deleting the order ...';
        self.processing = true;
        this.apiService.deleteOrder(success).subscribe((result) => {
          console.log(`addOrder success: result = ${JSON.stringify(result)}`);
          self.processing = false;
          self.isError = false;
        }, (err) => {
          console.log('addOrder failed');
          this.errorMessage = err.message;
          this.processing = false;
          this.isError = true;
        });

      } else {
        self.errorMessage = 'Select the Order with NOT EXECUTED status';
        self.processing = false;
        self.isError = true;
      }
    },
    (err) => {
      console.log('deleteOrder failed');
    });
  }

  alertClosed(): void {
    this.isError = false;
  }
}
