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

  public addOrder(order: Order): Observable<any>  {
    console.log(`addOrder: Order is: ${order.serialize()}`);
    const endpoint = this.getApiMethodUrl('addorder');
    console.log(`Calls the endpoint: ${endpoint}`);
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

  public getMyOrders(userToken: string): Observable<any>  {
    console.log(`getMyOrders: userToken is: ${userToken}`);
    let endpoint = this.getApiMethodUrl('orders');
    endpoint += `?userToken=${userToken}`;
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
    let endpoint = this.getApiMethodUrl('orders');
    endpoint += '?userToken=';
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

  public updateOrder(id: string, order: ExtendedOrder): Observable<any>  {
    console.log('updateOrder');
    let endpoint = this.getApiMethodUrl('updateorder');
    endpoint += `/${id}`;
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
