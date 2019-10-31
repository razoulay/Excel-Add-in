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
        const userSession = this.dataService.getUserSession();

        if (userSession === null || userSession === undefined) {
            this.router.navigate(['authentication']);
            return false;
        }
        return true;
    }
 }
