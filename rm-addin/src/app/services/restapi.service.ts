import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { ConfigService } from './config.service';
import { DataService } from './data.service';

// imports models
import { UserAuth, UserSession } from '../models/userauth.model';
import { RestApiError, CustomErrorCode } from '../models/restapierror.model';
import { Order, ExtendedOrder } from '../models/order.model';


declare var $: any;

@Injectable({
    providedIn: 'root'
})
export class RestApiService {

  constructor(private http: HttpClient, private configService: ConfigService) {
    console.log('RestApiService service created');
  }

  /**
   * Authenticate an user
   * @param user User authentication model
   */
  public authenticate(user: UserAuth): Observable<UserSession> {
    console.log(`authenticate: UserAuth is: ${user.serialize()}`);
    const endpoint = this.getApiMethodUrl('login');
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.post<UserSession>(endpoint, user.serialize(), httpOptions)
    .pipe(
      map(response => {
        return new UserSession().deserialize(response);
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }
	
  public getUsername(userToken: string):  Observable<any> {
    console.log(`getusename: in restapi service `+ userToken);
    let endpoint = this.getApiMethodUrl('getUsername');
    const timestamp = new Date().getTime();
    endpoint += `?et=${timestamp}&userToken=${userToken}`;
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>(endpoint, httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  
  public getUserInfo(userName: string):  Observable<any> {
    console.log(`getUserInfo: in restapi service `+ userName);
    let endpoint = this.getApiMethodUrl('getUserInfo');
    const timestamp = new Date().getTime();
    endpoint += `?et=${timestamp}&userName=${userName}`;
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>(endpoint, httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }


  public sendEmail(data: any): Observable<any>  {
    console.log(`sendEmail inside restapi service `);
    const endpoint = this.getApiMethodUrl('sendEmail');
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.post<UserSession>(endpoint, data, httpOptions)
    .pipe(
      map(response => {
        console.log("all good in restapi sendemail()");
        return response;
      }),
      catchError(error => {
        console.log("error in restapi sendemail()");
        return this.handleError(error);
      })
    );
  }


  public addOrder(orders: any): Observable<any>  {
    console.log(`addOrder: Order is: {order.serialize()}`);
    const endpoint = this.getApiMethodUrl('addorder');
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.post<UserSession>(endpoint, JSON.stringify(orders) , httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  public addBulkOrder(orders: any): Observable<any>  {
    console.log(`addBulkOrder: Order is: {order.serialize()}`);
    const endpoint = this.getApiMethodUrl('addbulkorder');
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.post<UserSession>(endpoint, JSON.stringify(orders) , httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }
  
  public getFilterOrders(Bank, AssetType): Observable<any>  {
    console.log('get filtered orders');
    let endpoint = this.getApiMethodUrl('getFilterOrders');
        const timestamp = new Date().getTime();
    endpoint += `?et=${timestamp}&Bank=${Bank}&AssetType=${AssetType}`;
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>(endpoint, httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  public getOrdersByStatus(status): Observable<any>  {
    console.log('get orders by status restapi');
    let endpoint = this.getApiMethodUrl('getOrdersByStatus');
        const timestamp = new Date().getTime();
    endpoint += `?et=${timestamp}&status=${status}`;
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>(endpoint, httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }


  public getOrders(userToken: string): Observable<any>  {
    console.log(`getMyOrders: userToken is: ${userToken}`);
    let endpoint = this.getApiMethodUrl('orders');
	const timestamp = new Date().getTime();
    endpoint += `?et=${timestamp}&userToken=${userToken}`;
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>(endpoint, httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }
  

  public getRMOrders(): Observable<any>  {
    console.log('getRMOrders');
    let endpoint = this.getApiMethodUrl('RMorders');
	const timestamp = new Date().getTime();
    endpoint += `?et=${timestamp}&userToken=`;
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>(endpoint, httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  public updateOrder(order: ExtendedOrder, isTrader: boolean): Observable<any>  {
    if (isTrader==false){
	console.log('updateOrder');
    	let endpoint = this.getApiMethodUrl('updateorder');
    	endpoint += `/${order.id}`;
    	const httpOptions = {
      		headers: new HttpHeaders({
        	'Content-Type':  'application/json'
      		})
    	};
    	return this.http.post<UserSession>(endpoint, order.serialize(), httpOptions)
    	.pipe(
      		map(response => {
       			return response;
    		}),
      		catchError(error => {
        		return this.handleError(error);
      		})
    	);
     }
     else if(isTrader==true){
     	console.log('updateOrder - BookOrder in restapi');
    	let endpoint = this.getApiMethodUrl('bookOrder');
    	endpoint += `/${order.id}`;
    	const httpOptions = {
      		headers: new HttpHeaders({
        	'Content-Type':  'application/json'
      		})
    	};
    	return this.http.post<UserSession>(endpoint, order.serialize(), httpOptions)
    	.pipe(
      		map(response => {
       			return response;
    		}),
      		catchError(error => {
        		return this.handleError(error);
      		})
    	);
     }
  }


  public updateAllocation(allocation: ExtendedOrder): Observable<any>  {
    
        console.log('updateAllocation in restapi');
        let endpoint = this.getApiMethodUrl('updateAllocation');
        endpoint += `/${allocation.id}`;
        const httpOptions = {
                headers: new HttpHeaders({
                'Content-Type':  'application/json'
                })
        };
        return this.http.post<UserSession>(endpoint, allocation.serialize(), httpOptions)
        .pipe(
                map(response => {
                        return response;
                }),
                catchError(error => {
                        return this.handleError(error);
                })
        );
     
  }

  public deleteOrder(id: string): Observable<any>  {
    console.log(`deleteOrder: id is: ${id}`);
    let endpoint = this.getApiMethodUrl('deleteorder');
    endpoint += `/${id}`;
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.delete<any>(endpoint, httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  public getAllocationsByOrderId(orderId: string): Observable<any>  {
    console.log('rest_api_code: getAllocationsByOrderId');
    let endpoint = this.getApiMethodUrl('getAllocationsByOrderId');
    const timestamp = new Date().getTime();
    endpoint += `?orderId=${orderId}&et=${timestamp}&userToken=`;
    console.log(`Calls the endpoint: ${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>(endpoint, httpOptions)
    .pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  private getApiMethodUrl(id: string): string {
    const configModel = this.configService.getModel();
    const apiMethod = DataService.getFirstWhere(configModel.apiMethods, (item) => {
      return (item.name === id);
    });

    return apiMethod.host + apiMethod.method;
  }

  private handleError(error: HttpErrorResponse) {
    console.log('Handle the error response');
    let restApiError = null;
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.log(`A client-side or network error occurred: ${error.error.message}`);
      restApiError = new RestApiError().deserialize({
        context: null,
        code: CustomErrorCode.CommonNetworkError,
        message: error.error.message
      });
    } else {
      if (error.error.error !== undefined) {
        restApiError = new RestApiError().deserialize(error.error.error);
      } else {
        restApiError = new RestApiError(error.message, error.status);
      }
      console.log(`The backend returned an unsuccessful response code: ${error.status}, body is: ${restApiError.serialize()}`);
    }
    // return an observable
    return throwError(restApiError);
  }
}
