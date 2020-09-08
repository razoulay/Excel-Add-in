import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../../services/data.service';
import { OfficehelperService } from '../../services/officehelper.service';
import { RestApiService } from '../../services/restapi.service';

import { Order, ExtendedOrder } from '../../models/order.model';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  
  public userType: number;
  public allowUpdateOrders: boolean;
  public userToken: string;
  public errorMessage: string;
  public isError: boolean;
  processing: boolean;
  loadingText: string;
  isFilterButtonVisible: boolean;
  isSendButtonVisible: boolean;
  isSelectButtonVisible: boolean;
  isExecuteButtonVisible: boolean;
  isStatusButtonVisible: boolean;
  isUpdateButtonVisible: boolean;
  isCancelButtonVisible: boolean;
  isUpdateAllocationsVisible: boolean;

  nDay: number;
  nMonth: number;
  nYear: number;
	
  constructor(private router: Router, private dataService: DataService, private officeHelper: OfficehelperService,
              private apiService: RestApiService) {
    console.log('DashboardComponent is created');
  }

  ngOnInit() {
    console.log('DashboardComponent initializing...');
    const userSession = this.dataService.getUserSession();
    if (userSession !== null && userSession !== undefined) {
      this.userType = userSession.userType;
      this.allowUpdateOrders = userSession.allowUpdateOrders;
      this.isFilterButtonVisible = false;
      this.isSendButtonVisible = true;
      this.isSelectButtonVisible = false;
      this.isExecuteButtonVisible = false;
      this.isStatusButtonVisible = false;
      this.isUpdateButtonVisible = false;
      this.isCancelButtonVisible = false;
      this.isUpdateAllocationsVisible = false;
      this.userToken = userSession.userToken;
      
      this.nDay = 0;
      this.nMonth = 0; 
      this.nYear = 0;

      console.log('userType: '+ this.userType);      
      if (this.userType == 2) {
        this.officeHelper.newTradeSheet().subscribe((result: boolean) => {
          console.log('newTradeSheet successfully '+this.userType);
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
	
  sendEmail(data: any){
              

	      
  	      console.log("send email function in dashboard.ts");
  	      this.apiService.sendEmail(data).subscribe((result) => {
                console.log(`sendemail success: result = ${JSON.stringify(result)}`);
                
                this.processing = false;

  		
              }, (err) => {
                console.log('send  order failed');
                this.errorMessage = err.message;
                this.processing = false;
                this.isError = true;
              }); 

  }
  

  filteredOrderSheet() {
    this.isFilterButtonVisible = true;
    this.isSelectButtonVisible = false;
    this.isExecuteButtonVisible = false;
    this.isStatusButtonVisible = false;
    this.isUpdateButtonVisible = false;
    this.isCancelButtonVisible = false;
    this.isUpdateAllocationsVisible = false;

    this.officeHelper.filteredOrderSheet().subscribe((result: boolean) => {
      console.log('filtered Sheet created successfully');
    },
    (err) => {
      console.log('filtered sheet created failed');
    });
  }


  getFilterOrders() {
    
    this.officeHelper.checkFilteredData().subscribe((success: boolean) => {
      if (!success) {
        this.errorMessage = 'One of the fields is missing! ';
        this.isError = true;
      } else {
  
          this.apiService.getUsername(this.userToken).subscribe((result: any) => {
            this.officeHelper.getFilteredParamaters().subscribe((valuesRes: any) => {
              console.log(' getFilteredParamaters successful! ');
  
              if (valuesRes !== null) {
                  
                console.log("AssetType: "+ valuesRes[0] );
                console.log("Bank: "+ valuesRes[1] + " end");
                
                let Bank = valuesRes[1];
                let AssetType = valuesRes[0];
                
                const self = this;
                self.loadingText = 'Loading Filterd Orders ...';
                self.processing = true;
                
                
                this.apiService.getFilterOrders(Bank, AssetType).subscribe((apiResponse) => {
                    console.log(`get filtered orders success: result = ${JSON.stringify(apiResponse)}`);
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
                    console.log('Get filtered orders failed');
                    this.errorMessage = err.message;
                    this.processing = false;
                    this.isError = true;
                });
              }
            },
            (err) => {
              console.log('FilteredSheet failed');
            });
          },
          (err) => {
            console.log('getusername failed');
          });
      }
    },
    (err) => {
      console.log('checkNewTrade failed');
    });
    this.isFilterButtonVisible = false;
  }


  getOrders() {
    this.isSendButtonVisible = false;
    this.isSelectButtonVisible = true;
    this.isExecuteButtonVisible = false;
    this.isStatusButtonVisible = true;
    this.isUpdateButtonVisible = true;
    this.isCancelButtonVisible = true;
    this.isUpdateAllocationsVisible = false;

    const self = this;
    self.loadingText = 'Loading RM Orders ...';
    self.processing = true;
    
    
    if (this.userType == 1 || this.userType == 3 || this.userType == 4){
    	console.log("it is the trader OR the backoffice OR the SuperPower user")
        this.apiService.getOrders('').subscribe((apiResponse) => {
          console.log(`getOrders success: result = ${JSON.stringify(apiResponse)}`);
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
    else{
    	console.log("it is the RM in getOrders")
        this.apiService.getOrders(this.userToken).subscribe((apiResponse) => {
          console.log(`getOrders success: result = ${JSON.stringify(apiResponse)}`);
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
  }

  
  getRMOrders() {
    this.isSendButtonVisible = false;
    this.isSelectButtonVisible = true;
    this.isExecuteButtonVisible = false;
    this.isStatusButtonVisible = true;
    this.isUpdateButtonVisible = true;
    this.isCancelButtonVisible = true;
    this.isUpdateAllocationsVisible = false;

    const self = this;
    self.loadingText = 'Loading RM Orders ...';
    self.processing = true;
    
    if(this.userType == 1 || this.userType == 3 || this.userType == 4){
    	console.log("it is the trader OR backoffice OR superuser")
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
    else{
    	console.log("it is the RM in the getRMOrders")
        this.apiService.getRMOrders().subscribe((apiResponse) => {
          console.log(`getRMOrders success: result = ${JSON.stringify(apiResponse)}`);
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
	
  }



  newTrade() {
    this.isSendButtonVisible = true;
    this.isStatusButtonVisible = false;
    this.isSelectButtonVisible = false;
    this.isUpdateButtonVisible = false;
    this.isCancelButtonVisible = false;
    this.isUpdateAllocationsVisible = false;

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
      this.errorMessage = 'Please fill all fields with correct information ' +
        '';
      this.isError = true;
    } else {
    	
        this.apiService.getUsername(this.userToken).subscribe((result: any) => {
          this.officeHelper.getNewTradeData().subscribe((valuesRes: any) => {
            console.log('newTradeSheet successfully');

            if (valuesRes !== null) {
              self.loadingText = 'Sending trades ...';
              self.processing = true;

              console.log("valuesRes[0]: "+ valuesRes[0] + " end");
              console.log("valuesRes[1]: "+ valuesRes[1]);
              let metadata = valuesRes[0];
              let values = valuesRes[1];

              let receivedResults = 0;
              let totalResults = values.length;
              var orders = [];
              for (let index = 0; index < values.length; index++) {
                const orderData = values[index];
                const order = new ExtendedOrder();
                order.user_token = self.userToken;
                order.account = orderData[0];
		order.broker_name = orderData[2];

                order.asset_type = metadata[0][1];
                order.isin = metadata[1][1];
                order.security_name = metadata[2][1];
		order.side = metadata[3][1];
		order.op_type = metadata[5][1];
                order.limit_price = metadata[5][3];
		order.instructions = metadata[7][1];

		if(metadata[6][1] == "GTD"){
		
			this.ExcelSerialDateToDMY(metadata[6][3]);	
	        	order.tif = this.nMonth + '/' + this.nDay + '/' + this.nYear;
                }
		else{
			var today = new Date();
		        var dd = String(today.getDate()).padStart(2, '0');
          		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          		var yyyy = String(today.getFullYear());
          		var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
			var day = mm + '/' + dd + '/' + yyyy;

			order.tif = day;
                }
             
		console.log('dashboard.ts - sendOrder  order.tif: '+ typeof(order.tif));	
                order.portfolio_manager = result.rows[0].name;
                order.status = 'NEW';
		
		if (order.asset_type == "Bonds"){
			orderData[1] = orderData[1] * 1000;
			order.amount_ordered = orderData[1];
		}
		else{
			order.amount_ordered = orderData[1];
		}
		var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = String(today.getFullYear());
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var day = mm + '/' + dd + '/' + yyyy  + ' - ' + time;
		order.order_creation = day;
		


                if (order.account === null || order.account === undefined || order.account === '') {
                  totalResults--;
                  continue;
                }

                orders.push(order);
              }
                this.apiService.addOrder(orders).subscribe((result) => {
                    console.log(`addOrder success: result = ${JSON.stringify(result)}`);
                    self.getRMOrders();
		    
		    //Send email to trader.
		    var message = 'A new order has been recieved '
                    var data = []
                    data[0] = 'dchiacchiari@ffstrategies.net'
                    data[1] = message
                    self.sendEmail(data)

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
            },
            (err) => {
              console.log('newTradeSheet failed');
            });
          },
          (err) => {
            console.log('getusername failed');
          });
      }
    },
    (err) => {
      console.log('checkNewTrade failed');
    });
}


  updateOrder() { 	//To update the order. It doesnt update the allocations details such as the quantities. 
  console.log('updateOrder in dashboard.ts');
  const self = this;
  const isTrader = this.userType == 1 ? true : false;
  var bookOrder = false; //Trader can update order as RM. But if he fills average price field, it means he executed the order, so will route to bookOrder in backend.
  
    this.apiService.getUsername(this.userToken).subscribe((result: any) => {
      this.officeHelper.getChangedOrder(isTrader, false).subscribe((orders: any) => {
        if (orders === null || orders === undefined || orders.length <= 0) {
          this.errorMessage = 'You cant modify executed, working or canceled order';
          this.isError = true;
        } else {
          let receivedResults = 0;
          let totalResults = orders.length;
          self.loadingText = 'Updateing Orders ...';
          self.processing = true;
          for (let index = 0; index < orders.length; index++) {
            const order = orders[index];
            console.log("istrader? "+ isTrader)
            
	    if(isTrader === false) {
            	order.status = 'MODIFIED';
	    }
          
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = String(today.getFullYear());
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          

	    if (isTrader && order.average_price != "") {
                  bookOrder = true;
	    }

            if (isTrader && bookOrder) {
                  var day = mm + '/' + dd + '/' + yyyy + ' - ' + time;
		  order.ts_order_date = day;
		  order.trader_name = result.rows[0].name; 
            }
          
            else if (!bookOrder) {
                  var day = mm + '/' + dd + '/' + yyyy + ' - ' + time ;
		  order.last_touched = day;
		  order.average_price = "";
            }
            console.log("order.average Price: "+ order.portfolio_manager);
          
            this.apiService.updateOrder(order, bookOrder).subscribe((result) => {
              console.log(`updateOrder success: result = ${JSON.stringify(result)}`);
              receivedResults++;
              if (receivedResults >= totalResults) {
                self.processing = false;
                if (result.success !== true) {
                  self.errorMessage = result.error;
                  self.isError = true;
                
		}
		if (bookOrder){
			this.apiService.getUserInfo(order.portfolio_manager).subscribe((result) => {
              			console.log(`getUserInfo success: result = ${JSON.stringify(result)}`);
              			receivedResults++;
              			if (receivedResults >= totalResults) {
                			self.processing = false;
                			if (result.success !== true) {
                  				self.errorMessage = result.error;
                  				self.isError = true;

                			}
					var message = "Your order to "+order.side+ " "+order.security_name+" for "+ order.broker_name +" has been executed at an average price of: "+ order.average_price
					var data = []
					data[0] = (result.rows[0].email)
					data[1] = message
					self.sendEmail(data)

              	 	}
            		}, (err) => {
              			console.log('getUserInfo failed');
              			self.errorMessage = err.message;
              			self.processing = false;
              			self.isError = true;
            		});
		
	      	}
              }
            }, (err) => {
              console.log('updateOrder failed');
              self.errorMessage = err.message;
              self.processing = false;
              self.isError = true;
            });
	    
	    
	  }
          self.getRMOrders();
        }
      },
      (err) => {
        console.log('updateOrder failed');
      });
    },
    (err) => {
      console.log('updateOrder failed');
    });
}


updateAllocations() {       //To update quantities of allocation.
  console.log('updateAllocations in dashboard.ts');
  const self = this;
  const isTrader = this.userType == 1 ? true : false;
  var bookOrder = false; //Trader can update order as RM. But if he fills average price field, it means he executed the order, so will route to bookOrder in backend.

    this.apiService.getUsername(this.userToken).subscribe((result: any) => {
      this.officeHelper.getChangedOrder(isTrader, true).subscribe((orders: any) => {
        if (orders === null || orders === undefined || orders.length <= 0) {
          this.errorMessage = 'You cant modify executed, working or canceled order';
          this.isError = true;
        } else {
          let receivedResults = 0;
          let totalResults = orders.length;
          self.loadingText = 'Updateing Allocations ...';
          self.processing = true;
          for (let index = 0; index < orders.length; index++) {
            const allocation = orders[index];
            console.log("istrader? "+ isTrader)
            
            allocation.status = 'MODIFIED';
          

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = String(today.getFullYear());
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();


          

            if (isTrader) {
                  allocation.trader_name = result.rows[0].name;
            }

            
            var day = mm + '/' + dd + '/' + yyyy + ' - ' + time ;
            allocation.last_touched = day;
            
            
            
	    console.log('allocation.amount_ordered: '+allocation.amount_ordered);
            this.apiService.updateAllocation(allocation).subscribe((result) => {
              console.log(`updateAllocation success: result = ${JSON.stringify(result)}`);
              receivedResults++;
              if (receivedResults >= totalResults) {
                self.processing = false;
                if (result.success !== true) {
                  self.errorMessage = result.error;
                  self.isError = true;

                }
              }
            }, (err) => {
              console.log('updateAllocation failed');
              self.errorMessage = err.message;
              self.processing = false;
              self.isError = true;
            });
          }
	  self.getRMOrders();
	  }
      },
      (err) => {
        console.log('updateAllocations failed');
      });
    },
    (err) => {
      console.log('updateAllocations failed');
    });
}

        
  updateStatusOrder() {
    
    console.log('Update Order Status');
    const self = this;
    const isTrader = this.userType == 1 ? true : false;
   

    this.officeHelper.getSelectedOrder(isTrader, 1).subscribe((orders: any) => {
      if (orders === null || orders === undefined || orders.length <= 0) {
        this.errorMessage = 'You cant modify executed or canceled order ';
        this.isError = true;
      } else {
        let receivedResults = 0;
        let totalResults = orders.length;
        self.loadingText = 'Updateing Status Orders ...';
        self.processing = true;
        
	for (let index = 0; index < orders.length; index++) {
	  const order = orders[index];
	  if (isTrader){
	  	console.log("it is trader - order.status: "+order.status)
		if (order.status == "WORKING"){
			order.status = "MODIFIED";
			console.log("inside IF - order.status: "+order.status);
		}
		else if (order.status == "MODIFIED" || order.status == "NEW"){
			order.status = "WORKING";
			console.log("inside IF - order.status: "+order.status);
		}
		else if (order.status == "SUSPENDED"){
			this.errorMessage = 'You cant modify suspended order ';
        		this.isError = true;
		}
			
	  }
	  else if(!isTrader){
	  	if (order.status == "SUSPENDED" )
                        order.status = "MODIFIED";
                else if (order.status == "MODIFIED" || order.status == "NEW")
                        order.status = "SUSPENDED";
		else if (order.status == "WORKING"){
                        this.errorMessage = 'You cant modify working order ';
                        this.isError = true;
                }
	  }
          console.log("order status: " + order.status + " isTrader: "+isTrader) 
          
	  if ( this.isError != true){
	  	
	  	var today = new Date();
          	var dd = String(today.getDate()).padStart(2, '0');
          	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          	var yyyy = String(today.getFullYear());
          	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          	var day = mm + '/' + dd + '/' + yyyy + ' - ' + time;
          	order.last_touched = day;

	  	this.apiService.updateOrder(order, false).subscribe((result) => {
            		console.log(`update Order status success: result = ${JSON.stringify(result)}`);
            		receivedResults++;
            		if (receivedResults >= totalResults) {
              			self.processing = false;
              			if (result.success !== true) {
                			self.errorMessage = result.error;
                			self.isError = true;
					self.getRMOrders();
              			}
            		}
          	}, (err) => {
            		console.log('update status Order failed');
            		self.errorMessage = err.message;
            		self.processing = false;
            		self.isError = true;
          	});
         }
        }
	self.getRMOrders();
      }
    },
    (err) => {
      console.log('update status Order failed');
    });
  }


  sendOrderToBank() {

    console.log('send order to bank function');
    const self = this;
    const isTrader = this.userType == 1 ? true : false;
    this.officeHelper.getSelectedOrder(isTrader, 1).subscribe((orders: any) => {
      if (orders === null || orders === undefined || orders.length <= 0) {
        this.errorMessage = 'You cant modify executed, suspended or canceled order ';
        this.isError = true;
      } else {
        let receivedResults = 0;
        let totalResults = orders.length;
        self.loadingText = 'Sending orders to bank ...';
        self.processing = true;

        for (let index = 0; index < orders.length; index++) {
          const order = orders[index];
          
                

          console.log("order status: " + order.status + " isTrader: "+isTrader)
          this.apiService.getAllocationsByOrderId(order.id).subscribe((result) => {
            console.log(`getAllocationsByOrderId Order status success: result = ${JSON.stringify(result)}`);
            this.sendEmail(result);   
           
          }, (err) => {
            console.log('update status Order failed');
            self.errorMessage = err.message;
            self.processing = false;
            self.isError = true;
          });
        }
        
      }
    },
    (err) => {
      console.log('update status Order failed');
    });
  }


  viewDetailedAllocations() {
    

    this.isExecuteButtonVisible = true; 
    this.isSendButtonVisible = false;
    this.isSelectButtonVisible = false;
    this.isStatusButtonVisible = false;
    this.isUpdateButtonVisible = false;
    this.isCancelButtonVisible = false;
    this.isUpdateAllocationsVisible = true;   

    console.log('view allocations linked to specific order');
    const self = this;
    const isTrader = this.userType == 1 ? true : false;
    

    this.officeHelper.getSelectedOrder(isTrader, 0).subscribe((orders: any) => {
      if (orders === null || orders === undefined || orders.length <= 0) {
        this.errorMessage = 'You cant modify executed, suspended or canceled order ';
        this.isError = true;
      } else {
        let receivedResults = 0;
        let totalResults = orders.length;
        self.loadingText = 'Get Allocations ...';
        self.processing = true;

        for (let index = 0; index < orders.length; index++) {
          const order = orders[index];



          console.log("order tif: " + order.tif + " typeof: "+typeof(order.tif))
          this.apiService.getAllocationsByOrderId(order.id).subscribe((result) => {
            console.log(`getAllocationsByOrderId Order status success: result = ${JSON.stringify(result)}`);
		try {
	              console.log("result.rows: "+typeof(result.rows)+ " "+result.rows+"        "+ typeof(order)+" order: " +order.status)
	              this.officeHelper.createDetailedRMOrdersSheet(result.headers, result.rows, order, this.allowUpdateOrders).subscribe((result: boolean) => {
        	        console.log('createDetailedRMOrdersSheet successfully');
                	self.processing = false;
              		},
              		(err) => {
                		console.log('createDetailedRMOrdersSheet failed');
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


          	}, (err) => {
            		console.log('update status Order failed');
            		self.errorMessage = err.message;
            		self.processing = false;
            		self.isError = true;
          	});
        }

      }
    },
    (err) => {
      console.log('update status Order failed');
    });

	
  }

  deleteOrder() {
    const self = this;
    this.officeHelper.getSelectedOrderId(true).subscribe((success: string) => {
      console.log(`getSelectedOrderId returned: ${success}`);
      if (success !== null && success.length > 0) {
        self.loadingText = 'Deleting orders ...';
        self.processing = true;
        let receivedResults = 0;
        let totalResults = success.length;
        for (let index = 0; index < success.length; index++) {
          const orderId = success[index];
          this.apiService.deleteOrder(orderId).subscribe((result) => {
            console.log(`addOrder success: result = ${JSON.stringify(result)}`);
            receivedResults++;
            if (receivedResults >= totalResults) {
              self.processing = false;
              self.isError = false;
              self.getRMOrders();
            }
          }, (err) => {
            console.log('addOrder failed');
            this.errorMessage = err.message;
            this.processing = false;
            this.isError = true;
          });
        }
        self.getRMOrders();
      } else {
        self.errorMessage = 'Cant cancel an order with EXECUTED or WORKING status';
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

  ExcelSerialDateToDMY(nSerialDate) {	
    console.log(`nSerialDate `+ nSerialDate);
    // Modified Julian to DMY calculation with an addition of 2415019
    let l = nSerialDate + 68569 + 2415019;
    let n = Math.floor(( 4 * l ) / 146097);
    l = l - Math.floor(( 146097 * n + 3 ) / 4);
    let i = Math.floor(( 4000 * ( l + 1 ) ) / 1461001);
    l = l - Math.floor(( 1461 * i ) / 4) + 31;
    let j = Math.floor(( 80 * l ) / 2447);
    
    console.log(`j `+ j);
    this.nDay = l - Math.floor(( 2447 * j ) / 80);
    l = Math.floor(j / 11);
    this.nMonth = j + 2 - ( 12 * l );
    this.nYear = 100 * ( n - 49 ) + i + l;
  }
}
