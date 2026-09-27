import {
    Component
} from '@angular/core';

import {
    CommonModule
} from '@angular/common';

import {
    Router,
    RouterLink,
    ActivatedRoute
} from '@angular/router';

import {
    MyWorldService
} from '../../../services/my-world.service';

import {
    GardenWorld
} from '../garden-world/garden-world';

import { StadiumWorld } from '../stadium-world/stadium-world';

import {
    SpaceBaseWorld
} from '../space-base-world/space-base-world';

type WorldType =
    | 'garden'
    | 'stadium'
    | 'space-base';

@Component({
    selector: 'app-my-world-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        GardenWorld,
        StadiumWorld,
        SpaceBaseWorld
    ],
    templateUrl: './my-world-page.html',
    styleUrl: './my-world-page.css'
})

export class MyWorldPage {

    private get worldPreferenceKey(): string | null {
        if (typeof window === 'undefined') return null;

        try {
            const identity = JSON.parse(
                localStorage.getItem('identity') || 'null'
            );

            return identity?._id
                ? `portergramSelectedWorld:${identity._id}`
                : null;
        } catch {
            return null;
        }
    }

    public myWorld: any = null;
    public loading = false;
    public error = '';

    public owlMuted: boolean = false;

    public viewedUserId: string | null = null;
    public viewingOtherUser: boolean = false;

    toggleOwlMute(): void {

        console.log(
            'ANTES:',
            this.owlMuted
        );

        this.owlMuted = !this.owlMuted;
        console.log(
            'DESPUÉS:',
            this.owlMuted
        );
    }

    public selectedWorld: WorldType | null = null;

    constructor(
        private myWorldService: MyWorldService,
        private router: Router,
        private route: ActivatedRoute
    ) {

        this.viewedUserId =
            this.route.snapshot.queryParamMap.get('userId');

        this.viewingOtherUser =
            !!this.viewedUserId;

        console.log(
            'MODO MUNDO:',
            {
                viewedUserId: this.viewedUserId,
                viewingOtherUser: this.viewingOtherUser
            }
        );

        if (this.viewingOtherUser) {

            this.loadUserWorld(
                this.viewedUserId!
            );

        } else {
            this.loadMyWorld();
        }
    }

    onWorldElementClicked(element: any): void {

        console.log(
            'ELEMENTO PULSADO:',
            element
        );

    }

    loadMyWorld(): void {
        const token = localStorage.getItem('token');

        if (!token) {
            this.error = 'No se encontró el token.';
            return;
        }

        this.loading = true;
        this.error = '';

        this.myWorldService.getMyWorld(token).subscribe({
            next: (response: any) => {
                const world = response.world;
                const worldType = world?.worldType;
                const key = this.worldPreferenceKey;

                const hiddenByUser =
                    key !== null && localStorage.getItem(key) === 'none';

                const validWorld =
                    worldType === 'garden' ||
                    worldType === 'stadium' ||
                    worldType === 'space-base';

                if (
                    hiddenByUser ||
                    response.visible === false ||
                    world?.visible === false ||
                    !validWorld
                ) {
                    this.myWorld = null;
                    this.selectedWorld = null;
                    this.loading = false;
                    return;
                }

                this.myWorld = {
                    ...world,
                    stats: response.stats,
                    progression: response.progression,
                    visualElements:
                        response.progression?.visualState?.full || []
                };

                this.selectedWorld = worldType;
                this.loading = false;
            },

            error: (error: any) => {
                this.myWorld = null;
                this.selectedWorld = null;
                this.error =
                    error?.error?.message ||
                    'No se pudo cargar Mi Mundo.';
                this.loading = false;
            }
        });
    }

    loadUserWorld(userId: string): void {

        const token =
            localStorage.getItem('token');

        if (!token) {

            this.error =
                'No se encontró el token.';

            return;
        }

        this.loading = true;
        this.error = '';

        this.myWorldService
            .getUserWorld(
                userId,
                token
            )
            .subscribe({

                next: (response: any) => {

                    console.log(
                        'MUNDO DEL USUARIO EN FULL:',
                        response
                    );

                    if (!response.world) {

                        this.myWorld = null;
                        this.selectedWorld = null;
                        this.loading = false;

                        return;
                    }

                    this.myWorld = {
                        ...response.world,

                        stats:
                            response.stats,

                        progression:
                            response.progression,

                        visualElements:
                            response.progression
                                ?.visualState
                                ?.full ||
                            response.world
                                ?.visualElements ||
                            []
                    };

                    this.selectedWorld =
                        response.world.worldType;

                    console.log(
                        'MUNDO FULL MOSTRADO:',
                        this.selectedWorld
                    );

                    this.loading = false;
                },

                error: (error: any) => {

                    console.error(
                        'ERROR CARGANDO MUNDO DE USUARIO:',
                        error
                    );

                    this.myWorld = null;

                    this.error =
                        error?.error?.message ||
                        'No se pudo cargar el mundo del usuario.';

                    this.loading = false;
                }

            });
    }

    goBack(): void {
        this.router.navigate(['/home']);
    }
}