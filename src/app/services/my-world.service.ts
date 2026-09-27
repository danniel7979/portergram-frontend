import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    MyWorldAsideResponse
} from '../models/my-world';


@Injectable({
    providedIn: 'root'
})
export class MyWorldService {

    public url = 'http://localhost:3800/api/';

    constructor(
        private http: HttpClient
    ) { }

    getAsideWorld(
        token: string
    ): Observable<MyWorldAsideResponse> {
        const headers = new HttpHeaders({
            Authorization: token
        });

        return this.http.get<MyWorldAsideResponse>(
            `${this.url}my-world/aside`,
            {
                headers
            }
        );
    }


    getMyWorld(token: string): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: token
        });

        return this.http.get(
            `${this.url}my-world`,
            { headers }
        );
    }

    getWorldCatalog(token: string) {
        return this.http.get(
            this.url + 'my-world/catalog',
            {
                headers: {
                    Authorization: token
                }
            }
        );
    }

    selectWorld(
        worldType: string,
        token: string
    ) {
        return this.http.post(
            this.url + 'my-world/select',
            {
                worldType
            },
            {
                headers: {
                    Authorization: token
                }
            }
        );
    }

    markWorldAsVisited(token: string) {
        return this.http.put(
            this.url + 'my-world/visit',
            {},
            {
                headers: {
                    Authorization: token
                }
            }
        );
    }

    getUserAsideWorld(userId: string, token: string) {
        const headers = new HttpHeaders({
            'Authorization': token
        });

        return this.http.get(
            this.url + 'my-world/user/' + userId + '/aside',
            { headers }
        );
    }

    setWorldVisibility(
        visible: boolean,
        token: string
    ) {
        return this.http.put(
            this.url + 'my-world/visibility',
            { visible },
            {
                headers: {
                    Authorization: token
                }
            }
        );
    }

    getUserWorld(
    userId: string,
    token: string
) {

    const headers =
        new HttpHeaders({
            Authorization: token
        });

    return this.http.get(
        `${this.url}my-world/user/${userId}`,
        { headers }
    );
}
}