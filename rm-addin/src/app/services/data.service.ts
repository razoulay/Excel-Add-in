import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UserSession } from '../models/userauth.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private userSessionKey: string;

  public static getFirstWhere<T>(array: T[], condition: (item: T) => boolean): T | undefined {
    for (const item of array) {
        if (condition(item) === true) {
          return item;
        }
    }
    return undefined;
  }

  constructor(private router: Router) {
    console.log('DataService constructor');
    this.userSessionKey = 'RmAddin_UserSession';
  }

  /**
   * Saves the user session in the sessionStorage and localStorage (if the isRemember == true)
   *
   * @param userSession  UserSession object
   * @param isRemember  Is the userSession should be remembered
   *
   */
  public setUserSession(userSession: UserSession): void {
    sessionStorage.setItem(this.userSessionKey, userSession.serialize());
    console.log(`Save Session Item: ${sessionStorage.getItem(this.userSessionKey)}`);
  }

  /**
   * Loads the userSession object from sessionStorage or localStorage
   */
  public getUserSession(): UserSession {
    const value = sessionStorage.getItem(this.userSessionKey);
    console.log(`Get Session Item: ${value}`);
    return (value === null || value === undefined) ? null : new UserSession().deserialize(JSON.parse(value));
  }

  /**
   * Clears all data about UserSession
   */
  public clearUserSession(): void {
    sessionStorage.removeItem(this.userSessionKey);
  }

  public create_UUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }
}
