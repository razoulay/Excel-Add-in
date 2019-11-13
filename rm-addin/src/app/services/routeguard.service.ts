import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { DataService } from './data.service';

@Injectable()
export class RouteGuardService implements CanActivate {

    constructor(
        private router: Router, private dataService: DataService) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {

        console.log(`Routing request: ${state.url}`);
        if (state.url === '/dashboard') {
            const userSession = this.dataService.getUserSession();

            if (userSession === null || userSession === undefined) {
                console.log('Navigate to /authentication');
                this.router.navigate(['authentication']);
                return true;
            }
        } else if (state.url === '/authentication') {
            const userSession = this.dataService.getUserSession();

            if (userSession !== null && userSession.userToken !== '') {
                console.log('Navigate to /dashboard');
                this.router.navigate(['dashboard']);
                return true;
            }
        }

        return true;
    }
 }
