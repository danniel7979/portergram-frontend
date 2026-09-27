import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    OnDestroy,
    HostListener,
    Output,
    SimpleChanges
} from '@angular/core';

import {
    CommonModule
} from '@angular/common';



@Component({
    selector: 'app-garden-world',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './garden-world.html',
    styleUrl: './garden-world.css'
})

export class GardenWorld implements OnChanges, OnInit,
    OnDestroy {

    @Input() elements: any[] = [];
    @Input() owlMuted: boolean = false;
    @Input() mode: 'aside' | 'full' = 'aside';
    public compactFullLayout = false;

    @HostListener('window:resize')
    onViewportResize(): void {
        this.updateResponsiveLayout();
    }

    private updateResponsiveLayout(): void {
        this.compactFullLayout =
            this.mode === 'full' &&
            typeof window !== 'undefined' &&
            window.innerWidth <= 600;
    }
    getCactusStage(): string {
        const cactus = this.elements.find(
            element => element.id === 'garden-cactus'
        );

        return (
            cactus?.stageId ||
            cactus?.variant ||
            'small'
        );
    }



    public moonLight = 0.35;
    public moonX = 5;
    public moonY = 18;
    public moonPhase = '🌕';

    public timePhase:
        'dawn' |
        'day' |
        'sunset' |
        'night' = 'day';

    private timeInterval: any = null;

    public fireflies = [
        // Parte superior
        { x: 6, y: 12, delay: 0.3, duration: 5.4 },
        { x: 18, y: 20, delay: 1.8, duration: 6.1 },
        { x: 31, y: 9, delay: 2.6, duration: 5.2 },
        { x: 44, y: 23, delay: 0.7, duration: 6.4 },
        { x: 58, y: 14, delay: 3.1, duration: 5.6 },
        { x: 72, y: 25, delay: 1.4, duration: 6.0 },
        { x: 86, y: 11, delay: 2.2, duration: 5.1 },
        { x: 95, y: 28, delay: 0.5, duration: 6.3 },

        // Zona media-alta
        { x: 10, y: 36, delay: 2.7, duration: 5.8 },
        { x: 24, y: 42, delay: 0.9, duration: 6.2 },
        { x: 38, y: 34, delay: 1.7, duration: 5.3 },
        { x: 51, y: 45, delay: 3.3, duration: 6.5 },
        { x: 65, y: 37, delay: 0.4, duration: 5.5 },
        { x: 78, y: 46, delay: 2.4, duration: 6.1 },
        { x: 91, y: 39, delay: 1.2, duration: 5.7 },

        // Zona media-baja
        { x: 5, y: 58, delay: 1.6, duration: 6.4 },
        { x: 17, y: 67, delay: 3.0, duration: 5.2 },
        { x: 29, y: 55, delay: 0.6, duration: 5.9 },
        { x: 42, y: 70, delay: 2.1, duration: 6.3 },
        { x: 55, y: 59, delay: 1.0, duration: 5.4 },
        { x: 68, y: 73, delay: 3.5, duration: 6.0 },
        { x: 81, y: 61, delay: 0.8, duration: 5.6 },
        { x: 94, y: 69, delay: 2.8, duration: 6.2 },

        // Parte inferior
        { x: 9, y: 86, delay: 0.2, duration: 5.5 },
        { x: 22, y: 78, delay: 2.5, duration: 6.3 },
        { x: 35, y: 91, delay: 1.3, duration: 5.1 },
        { x: 49, y: 82, delay: 3.2, duration: 6.5 },
        { x: 62, y: 93, delay: 0.7, duration: 5.8 },
        { x: 75, y: 84, delay: 2.0, duration: 6.1 },
        { x: 88, y: 90, delay: 1.5, duration: 5.3 },
        { x: 97, y: 80, delay: 3.4, duration: 6.4 }
    ];

    ngOnDestroy(): void {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }

        this.stopOwl();
    }

    private updateMoon(): void {

        const now = new Date();

        const hour =
            now.getHours() +
            now.getMinutes() / 60;

        // Noche: 21:00 -> 06:00
        let nightProgress = 0;

        if (hour >= 21) {
            nightProgress =
                (hour - 21) / 9;
        }
        else if (hour < 6) {
            nightProgress =
                (hour + 3) / 9;
        }

        nightProgress =
            Math.max(
                0,
                Math.min(1, nightProgress)
            );

        // Izquierda -> derecha
        this.moonX =
            5 + nightProgress * 90;

        // Arco por el cielo:
        // más baja en extremos, más alta en el centro
        this.moonY =
            22 -
            Math.sin(
                nightProgress * Math.PI
            ) * 14;

        this.updateMoonPhase(now);
    }

    private updateMoonPhase(date: Date): void {

        const knownNewMoon =
            new Date(2024, 0, 11, 11, 57);

        const lunarCycle = 29.53058867;

        const daysSince =
            (
                date.getTime() -
                knownNewMoon.getTime()
            ) / 86400000;

        const lunarDay =
            (
                (daysSince % lunarCycle) +
                lunarCycle
            ) % lunarCycle;

        if (lunarDay < 1.85) {
            this.moonPhase = '🌑';
            this.moonLight = 0.15;
        }
        else if (lunarDay < 5.54) {
            this.moonPhase = '🌒';
            this.moonLight = 0.25;
        }
        else if (lunarDay < 9.23) {
            this.moonPhase = '🌓';
            this.moonLight = 0.45;
        }
        else if (lunarDay < 12.92) {
            this.moonPhase = '🌔';
            this.moonLight = 0.65;
        }
        else if (lunarDay < 16.61) {
            this.moonPhase = '🌕';
            this.moonLight = 0.85;
        }
        else if (lunarDay < 20.30) {
            this.moonPhase = '🌖';
            this.moonLight = 0.65;
        }
        else if (lunarDay < 23.99) {
            this.moonPhase = '🌗';
            this.moonLight = 0.45;
        }
        else if (lunarDay < 27.68) {
            this.moonPhase = '🌘';
            this.moonLight = 0.25;
        }
        else {
            this.moonPhase = '🌑';
            this.moonLight = 0.15;
        }
    }

    private updateTimePhase(): void {

        const hour = new Date().getHours();

        // 06:00 - 07:59
        if (hour >= 6 && hour < 8) {
            this.timePhase = 'dawn';
            return;
        }

        // 08:00 - 18:59
        if (hour >= 8 && hour < 19) {
            this.timePhase = 'day';
            return;
        }

        // 19:00 - 20:59
        if (hour >= 19 && hour < 21) {
            this.timePhase = 'sunset';
            return;
        }

        // 21:00 - 05:59
        this.timePhase = 'night';
        this.updateMoon();
    }

    public jumpingFrog = false;

    private frogAudio = new Audio(
        'assets/sounds/frog.wav'
    );

    private playFrogSound(): void {

        this.frogAudio.pause();
        this.frogAudio.currentTime = 0;
        this.frogAudio.volume = 0.85;

        this.frogAudio.play()
            .catch(error => {
                console.log(
                    'No se pudo reproducir la rana:',
                    error
                );
            });
    }

    private duckAudio = new Audio(
        'assets/sounds/duck.wav'
    );

    private playDuckSound(): void {

        this.duckAudio.pause();
        this.duckAudio.currentTime = 0;
        this.duckAudio.volume = 0.45;

        this.duckAudio.play()
            .catch(error => {
                console.log(
                    'No se pudo reproducir el pato:',
                    error
                );
            });
    }

    private owlAudio =
        new Audio('assets/sounds/owl.mp3');

    private owlTimeout: any = null;

    ngOnInit(): void {

        this.updateResponsiveLayout();

        this.updateTimePhase();

        this.timeInterval = setInterval(() => {
            this.updateTimePhase();
        }, 60000);

        this.scheduleOwl();
    }

    private scheduleOwl(): void {

        if (
            this.mode !== 'full' ||
            this.timePhase !== 'night' ||
            this.owlMuted ||
            !this.owlAudio
        ) {
            return;
        }

        if (this.owlTimeout) {
            clearTimeout(this.owlTimeout);
        }

        const delay =
            30000 +
            Math.random() * 90000;

        this.owlTimeout = setTimeout(() => {
            this.playOwl();
        }, delay);
    }

    private startOwl(): void {

        if (
            this.mode !== 'full' ||
            this.timePhase !== 'night' ||
            this.owlMuted ||
            !this.owlAudio
        ) {
            return;
        }

        this.owlTimeout = setTimeout(() => {

            this.playOwl();

        }, 2000);
    }

    private playOwl(): void {

        if (
            this.mode !== 'full' ||
            this.timePhase !== 'night' ||
            this.owlMuted ||
            !this.owlAudio
        ) {
            return;
        }

        this.owlAudio.currentTime = 0;

        this.owlAudio.play()
            .catch(error => {
                console.log(
                    'Búho bloqueado:',
                    error
                );
            });

        this.scheduleOwl();
    }

    private stopOwl(): void {

        if (this.owlTimeout) {
            clearTimeout(this.owlTimeout);
            this.owlTimeout = null;
        }

        this.owlAudio.pause();
        this.owlAudio.currentTime = 0;
    }

    private getNormalizedCactusStage():
        'small' | 'medium' | 'complete' {

        const stage = this.getCactusStage();

        if (stage === 'medium') {
            return 'medium';
        }

        if (
            stage === 'complete' ||
            stage === 'large'
        ) {
            return 'complete';
        }

        return 'small';
    }

    @Output() elementClicked =
        new EventEmitter<any>();

    /*
     * En móvil el escenario es vertical. Estas coordenadas forman una
     * composición propia, en vez de comprimir el mapa panorámico de escritorio.
     * Así las ramas y flores permanecen unidas al cactus y la zona del lago
     * conserva espacio suficiente para los animales y los controles táctiles.
     */
    private readonly mobileFullGardenLayouts: Record<
        'small' | 'medium' | 'complete',
        Record<
            string,
            {
                x: number;
                y: number;
                width: number;
                height: number;
                scale: number;
                rotation?: number;
            }
        >
    > = {
            small: {
                'garden-cactus': {
                    x: 50,
                    y: 49,
                    width: 15,
                    height: 25,
                    scale: 2.1
                },
                'garden-branch-1': {
                    x: 54,
                    y: 49,
                    width: 15,
                    height: 17,
                    scale: 0.55
                },
                'garden-branch-2': {
                    x: 36,
                    y: 51,
                    width: 15,
                    height: 17,
                    scale: 0.8
                },
                'garden-branch-3': {
                    x: 48,
                    y: 48,
                    width: 14,
                    height: 16,
                    scale: 0.8
                },
                'garden-flower-1': {
                    x: 63,
                    y: 57,
                    width: 8,
                    height: 8,
                    scale: 1.2
                },
                'garden-flower-2': {
                    x: 33,
                    y: 51,
                    width: 8,
                    height: 8,
                    scale: 0.9
                },
                'garden-flower-3': {
                    x: 54,
                    y: 51,
                    width: 8,
                    height: 8,
                    scale: 0.9
                },
                'garden-butterfly-1': {
                    x: 18,
                    y: 35,
                    width: 7,
                    height: 7,
                    scale: 1.2
                },
                'garden-butterfly-2': {
                    x: 75,
                    y: 34,
                    width: 7,
                    height: 7,
                    scale: 1.2
                },
                'garden-butterfly-3': {
                    x: 32,
                    y: 19,
                    width: 6,
                    height: 6,
                    scale: 1.2
                },
                'garden-butterfly-4': {
                    x: 66,
                    y: 16,
                    width: 6,
                    height: 6,
                    scale: 1.2
                }
            },
            medium: {
                'garden-cactus': {
                    x: 50,
                    y: 49,
                    width: 16,
                    height: 27,
                    scale: 2.6
                },
                'garden-branch-1': {
                    x: 53,
                    y: 48,
                    width: 17,
                    height: 19,
                    scale: 0.66
                },
                'garden-branch-2': {
                    x: 42,
                    y: 48,
                    width: 17,
                    height: 19,
                    scale: 0.66
                },
                'garden-branch-3': {
                    x: 54.5,
                    y: 43,
                    width: 16,
                    height: 18,
                    scale: 1.2
                },
                'garden-flower-1': {
                    x: 66,
                    y: 56,
                    width: 9,
                    height: 9,
                    scale: 1.4
                },
                'garden-flower-2': {
                    x: 42.5,
                    y: 54,
                    width: 9,
                    height: 9,
                    scale: 1.4
                },
                'garden-flower-3': {
                    x: 62,
                    y: 44,
                    width: 9,
                    height: 9,
                    scale: 1.4
                },
                'garden-butterfly-1': {
                    x: 19,
                    y: 36,
                    width: 7,
                    height: 7,
                    scale: 1.3
                },
                'garden-butterfly-2': {
                    x: 76,
                    y: 34,
                    width: 7,
                    height: 7,
                    scale: 1.3
                },
                'garden-butterfly-3': {
                    x: 35,
                    y: 18,
                    width: 6,
                    height: 6,
                    scale: 1.3
                },
                'garden-butterfly-4': {
                    x: 67,
                    y: 14,
                    width: 6,
                    height: 6,
                    scale: 1.3
                }
            },
            complete: {
                'garden-cactus': {
                    x: 57,
                    y: 45,
                    width: 17,
                    height: 29,
                    scale: 3
                },
                'garden-branch-1': {
                    x: 59,
                    y: 48,
                    width: 19,
                    height: 20,
                    scale: 0.9,
                    rotation: 25
                },
                'garden-branch-2': {
                    x: 46,
                    y: 45,
                    width: 19,
                    height: 20,
                    scale: 0.7
                },
                'garden-branch-3': {
                    x: 62,
                    y: 39,
                    width: 18,
                    height: 18,
                    scale: 1.25
                },
                'garden-flower-1': {
                    x: 75,
                    y: 52,
                    width: 9,
                    height: 9,
                    scale: 1.45
                },
                'garden-flower-2': {
                    x: 47,
                    y: 50,
                    width: 9,
                    height: 9,
                    scale: 1.45
                },
                'garden-flower-3': {
                    x: 72,
                    y: 41,
                    width: 9,
                    height: 9,
                    scale: 1.05
                },
                'garden-butterfly-1': {
                    x: 18,
                    y: 34,
                    width: 7,
                    height: 7,
                    scale: 1.35
                },
                'garden-butterfly-2': {
                    x: 78,
                    y: 34,
                    width: 7,
                    height: 7,
                    scale: 1.35
                },
                'garden-butterfly-3': {
                    x: 35,
                    y: 17,
                    width: 6,
                    height: 6,
                    scale: 1.35
                },
                'garden-butterfly-4': {
                    x: 67,
                    y: 13,
                    width: 6,
                    height: 6,
                    scale: 1.35
                }
            }
        };
    private readonly fullGardenLayouts: Record<
        string,
        Record<
            string,
            {
                x: number;
                y: number;
                width: number;
                height: number;
                scale: number;
                rotation?: number;
            }
        >
    > = {
            small: {
                'garden-cactus': {
                    x: 47,
                    y: 47,
                    width: 8,
                    height: 28,
                    scale: 2.5
                },

                'garden-branch-1': {
                    x: 50,
                    y: 54,
                    width: 7,
                    height: 17,
                    scale: 1.1,
                },

                'garden-branch-2': {
                    x: 47.3,
                    y: 68,
                    width: 7,
                    height: 17,
                    scale: 0.8
                },

                'garden-branch-3': {
                    x: 48.5,
                    y: 64,
                    width: 7,
                    height: 17,
                    scale: 0.8
                },

                'garden-flower-1': {
                    x: 56.1,
                    y: 57.5,
                    width: 5,
                    height: 8,
                    scale: 1.35
                },

                'garden-flower-2': {
                    x: 49,
                    y: 62,
                    width: 5,
                    height: 8,
                    scale: 0.85
                },

                'garden-flower-3': {
                    x: 50,
                    y: 58,
                    width: 5,
                    height: 8,
                    scale: 0.85
                },

                'garden-butterfly-1': {
                    x: 20,
                    y: 43,
                    width: 5,
                    height: 8,
                    scale: 1.45
                },

                'garden-butterfly-2': {
                    x: 69,
                    y: 38,
                    width: 5,
                    height: 8,
                    scale: 1.45
                },

                'garden-butterfly-3': {
                    x: 31,
                    y: 24,
                    width: 4,
                    height: 7,
                    scale: 1.45
                },

                'garden-butterfly-4': {
                    x: 63,
                    y: 20,
                    width: 4,
                    height: 7,
                    scale: 1.45
                }
            },

            medium: {
                'garden-cactus': {
                    x: 46,
                    y: 42,
                    width: 8,
                    height: 31,
                    scale: 4.9
                },

                'garden-branch-1': {
                    x: 48.5,
                    y: 50,
                    width: 9,
                    height: 22,
                    scale: 1.45
                },

                'garden-branch-2': {
                    x: 38,
                    y: 56,
                    width: 9,
                    height: 22,
                    scale: 1.45
                },

                'garden-branch-3': {
                    x: 50.8,
                    y: 27,
                    width: 9,
                    height: 22,
                    scale: 1.65
                },

                'garden-flower-1': {
                    x: 57.8,
                    y: 49,
                    width: 6,
                    height: 10,
                    scale: 1.6
                },

                'garden-flower-2': {
                    x: 36,
                    y: 52,
                    width: 6,
                    height: 10,
                    scale: 1.8
                },

                'garden-flower-3': {
                    x: 56,
                    y: 21,
                    width: 6,
                    height: 10,
                    scale: 1.6
                },

                'garden-butterfly-1': {
                    x: 55,
                    y: 58,
                    width: 5,
                    height: 8,
                    scale: 1.45
                },

                'garden-butterfly-2': {
                    x: 35,
                    y: 54,
                    width: 5,
                    height: 8,
                    scale: 1.65
                },

                'garden-butterfly-3': {
                    x: 54,
                    y: 34,
                    width: 4,
                    height: 7,
                    scale: 1.6
                },

                'garden-butterfly-4': {
                    x: 33,
                    y: 10,
                    width: 4,
                    height: 7,
                    scale: 1.6
                }

            },

            complete: {
                'garden-cactus': {
                    x: 46,
                    y: 38,
                    width: 9,
                    height: 35,
                    scale: 5.85
                },

                'garden-branch-1': {
                    x: 50,
                    y: 52,
                    width: 11,
                    height: 27,
                    scale: 1.5,
                    rotation: 25
                },

                'garden-branch-2': {
                    x: 36,
                    y: 51,
                    width: 11,
                    height: 27,
                    scale: 1.5,
                },

                'garden-branch-3': {
                    x: 52,
                    y: 16,
                    width: 11,
                    height: 27,
                    scale: 1.9
                },

                'garden-flower-1': {
                    x: 60,
                    y: 49,
                    width: 7,
                    height: 12,
                    scale: 1.7
                },

                'garden-flower-2': {
                    x: 34,
                    y: 43,
                    width: 7,
                    height: 12,
                    scale: 1.7
                },

                'garden-flower-3': {
                    x: 59,
                    y: 15,
                    width: 7,
                    height: 12,
                    scale: 1.7
                },

                'garden-butterfly-1': {
                    x: 60,
                    y: 43,
                    width: 5,
                    height: 8,
                    scale: 1.95
                },

                'garden-butterfly-2': {
                    x: 33,
                    y: 38,
                    width: 5,
                    height: 8,
                    scale: 1.65
                },

                'garden-butterfly-3': {
                    x: 55,
                    y: 8,
                    width: 4,
                    height: 7,
                    scale: 1.6
                },

                'garden-butterfly-4': {
                    x: 23,
                    y: 8,
                    width: 4,
                    height: 7,
                    scale: 1.6
                }

            }
        };

    private getLakeStage(
        element: any
    ): 'small' | 'medium' | 'complete' {

        const stage =
            element.stageId ||
            element.variant ||
            'small';

        if (stage === 'medium') {
            return 'medium';
        }

        if (
            stage === 'complete' ||
            stage === 'large'
        ) {
            return 'complete';
        }

        return 'small';
    }

    private getMobileFullLayout(
        element: any
    ): {
        x: number;
        y: number;
        width: number;
        height: number;
        scale: number;
        rotation?: number;
    } | null {
        if (!this.compactFullLayout) {
            return null;
        }

        if (
            element.id === 'garden-cactus' &&
            (element.variant === 'seed' || element.stageId === 'seed')
        ) {
            return {
                x: 43,
                y: 56,
                width: 15,
                height: 25,
                scale: 1.45
            };
        }

        if (element.id === 'garden-lake') {
            const lakeLayouts = {
                small: {
                    x: 84,
                    y: 82,
                    width: 20,
                    height: 12,
                    scale: 1
                },
                medium: {
                    x: 82,
                    y: 82,
                    width: 28,
                    height: 16,
                    scale: 1
                },
                complete: {
                    x: 80,
                    y: 82,
                    width: 38,
                    height: 20,
                    scale: 1
                }
            };

            return lakeLayouts[this.getLakeStage(element)];
        }

        if (element.id === 'garden-ducks') {
            const duckLayouts = {
                small: {
                    x: 63,
                    y: 76,
                    width: 22,
                    height: 12,
                    scale: 1
                },
                medium: {
                    x: 63,
                    y: 75,
                    width: 30,
                    height: 14,
                    scale: 1
                },
                complete: {
                    x: 63,
                    y: 69,
                    width: 36,
                    height: 17,
                    scale: 1
                }
            };

            return duckLayouts[this.getDuckStage(element)];
        }

        if (element.id === 'garden-frog') {
            const frogStage =
                element.stageId ||
                element.variant ||
                'shore';

            return frogStage === 'lilypad'
                ? {
                    x: 57,
                    y: 75,
                    width: 13,
                    height: 11,
                    scale: 0.65
                }
                : {
                    x: 50,
                    y: 78,
                    width: 12,
                    height: 10,
                    scale: 0.65
                };
        }

        const fixedLayouts: Record<
            string,
            {
                x: number;
                y: number;
                width: number;
                height: number;
                scale: number;
                rotation?: number;
            }
        > = {
            'garden-ground': {
                x: 0,
                y: 66,
                width: 100,
                height: 34,
                scale: 1
            },
            'garden-gnome-house': {
                x: 6,
                y: 46,
                width: 26,
                height: 24,
                scale: 1.4
            },
            'garden-gnome-path': {
                x: 4,
                y: 73,
                width: 92,
                height: 22,
                scale: 1,
                rotation: 0
            },
            'garden-gnome-1': {
                x: 10,
                y: 62,
                width: 14,
                height: 18,
                scale: 0.9
            },
            'garden-gnome-2': {
                x: 37,
                y: 74,
                width: 13,
                height: 17,
                scale: 1.2
            }
        };

        const cactusStage =
            this.getNormalizedCactusStage();

        return (
            this.mobileFullGardenLayouts[cactusStage]?.[element.id] ||
            fixedLayouts[element.id] ||
            null
        );
    }

    private keepCactusClusterAligned(
        element: any,
        layout: {
            x: number;
            y: number;
            width: number;
            height: number;
            scale: number;
            rotation?: number;
        }
    ): typeof layout {
        if (typeof window === 'undefined') return layout;

        const clusterIds = [
            'garden-cactus',
            'garden-branch-1', 'garden-branch-2', 'garden-branch-3',
            'garden-flower-1', 'garden-flower-2', 'garden-flower-3'
        ];
        if (!clusterIds.includes(element.id)) return layout;

        const viewportWidth = window.innerWidth;
        const stage = this.getNormalizedCactusStage();

        if (viewportWidth > 600 && viewportWidth < 900) {
            const mobile = this.mobileFullGardenLayouts[stage][element.id];
            if (!mobile) return layout;

            const progress = (viewportWidth - 600) / 300;
            const between = (start: number, end: number) =>
                start + (end - start) * progress;

            const mobileSceneHeight = Math.min(
                760,
                Math.max(680, window.innerHeight * 0.92)
            );
            const mobileHeightFactor = mobileSceneHeight / 650;

            return {
                x: between(mobile.x, layout.x),
                y: between(mobile.y * mobileHeightFactor, layout.y),
                width: between(mobile.width, layout.width),
                height: between(mobile.height * mobileHeightFactor, layout.height),
                scale: between(mobile.scale, layout.scale),
                rotation:
                    mobile.rotation === undefined &&
                        layout.rotation === undefined
                        ? undefined
                        : between(mobile.rotation ?? 0, layout.rotation ?? 0)
            };
        }

        if (viewportWidth >= 500) return layout;

        const cactus = this.mobileFullGardenLayouts[stage]['garden-cactus'];
        if (!cactus) return layout;

        const factor = 500 / viewportWidth;
        const cactusCenter = cactus.x + cactus.width / 2;
        const elementCenter = layout.x + layout.width / 2;
        const width = layout.width * factor;

        return {
            ...layout,
            x: cactusCenter +
                (elementCenter - cactusCenter) * factor -
                width / 2,
            width
        };
    }

    private getFullLayout(
        element: any
    ): {
        x: number;
        y: number;
        width: number;
        height: number;
        scale: number;
        rotation?: number;
    } | null {
        if (this.mode !== 'full') {
            return null;
        }
        if (
            element.id === 'garden-cactus' &&
            (element.variant === 'seed' || element.stageId === 'seed')
        ) {
            return this.compactFullLayout
                ? { x: 43, y: 57, width: 15, height: 25, scale: 1.8 } // móvil
                : { x: 48, y: 55, width: 8, height: 28, scale: 1.5 }; // tablet/escritorio
        }

        const mobileLayout = this.getMobileFullLayout(element);
        if (mobileLayout) {
            return this.keepCactusClusterAligned(element, mobileLayout);
        }

        if (
            typeof window !== 'undefined' &&
            window.innerWidth > 600 &&
            window.innerWidth <= 1200
        ) {
            let group: string = this.getNormalizedCactusStage();
            let key = element.id;

            if (element.id === 'garden-lake') {
                group = 'lake';
                key = this.getLakeStage(element);
            } else if (element.id === 'garden-ducks') {
                group = 'ducks';
                key = this.getDuckStage(element);
            } else if (element.id === 'garden-frog') {
                group = 'frog';
                key = element.stageId === 'lilypad' ? 'lilypad' : 'shore';
            }

            const tabletLayout =
                this.tabletFullGardenLayouts[group]?.[key] ??
                this.tabletFullGardenLayouts['common']?.[element.id];

            if (tabletLayout) {
                return this.keepCactusClusterAligned(element, tabletLayout);
            }
        }

        if (element.id === 'garden-lake') {
            const lakeStage:
                'small' | 'medium' | 'complete' =
                this.getLakeStage(element);

            const lakeLayouts: Record<
                'small' | 'medium' | 'complete',
                {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    scale: number;
                    rotation?: number;
                }
            > = {
                small: {
                    x: 79,
                    y: 82,
                    width: 18,
                    height: 11,
                    scale: 1
                },

                medium: {
                    x: 78,
                    y: 81,
                    width: 24,
                    height: 14,
                    scale: 1
                },

                complete: {
                    x: 77,
                    y: 80,
                    width: 31,
                    height: 18,
                    scale: 1
                }
            };

            return lakeLayouts[lakeStage];
        }

        if (element.id === 'garden-ducks') {
            const duckStage =
                this.getDuckStage(element);

            const duckLayouts: Record<
                'small' | 'medium' | 'complete',
                {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    scale: number;
                    rotation?: number;
                }
            > = {
                small: {
                    x: 78,
                    y: 79,
                    width: 7,
                    height: 6,
                    scale: 1
                },

                medium: {
                    x: 77,
                    y: 79,
                    width: 11,
                    height: 7,
                    scale: 1
                },

                complete: {
                    x: 76,
                    y: 78,
                    width: 16,
                    height: 9,
                    scale: 1
                }
            };

            return duckLayouts[duckStage];
        }

        if (element.id === 'garden-frog') {

            const stage =
                element.stageId ||
                element.variant ||
                'shore';

            if (stage === 'lilypad') {
                return {
                    x: 68,
                    y: 88,
                    width: 8,
                    height: 8,
                    scale: 0.5
                };
            }

            return {
                x: 57,
                y: 85,
                width: 7,
                height: 7,
                scale: 0.6
            };
        }

        if (element.id === 'garden-gnome-1') {
            return {
                x: 15,
                y: 70,
                width: 8,
                height: 16,
                scale: 1
            };
        }

        if (element.id === 'garden-gnome-2') {
            return {
                x: 34,
                y: 75,
                width: 8,
                height: 16,
                scale: 1
            };
        }

        if (element.id === 'garden-gnome-path') {

            return {
                x: 15,
                y: 75,
                width: 100,
                height: 25,
                scale: 1.2,
                rotation: 0
            };
        }

        const cactusStage =
            this.getNormalizedCactusStage();

        return (
            this.fullGardenLayouts[cactusStage]?.[element.id] ||
            null
        );
    }

    private readonly tabletFullGardenLayouts: Record<
        string,
        Record<string, {
            x: number;
            y: number;
            width: number;
            height: number;
            scale: number;
            rotation?: number;
        }>
    > = {
            small: {
                'garden-cactus': { x: 48, y: 47, width: 8, height: 28, scale: 2.5 },
                'garden-branch-1': { x: 50, y: 54, width: 7, height: 17, scale: 1.1 },
                'garden-branch-2': { x: 47.3, y: 60, width: 7, height: 17, scale: 0.8 },
                'garden-branch-3': { x: 48.5, y: 58, width: 7, height: 17, scale: 0.8 },
                'garden-flower-1': { x: 56.1, y: 57.5, width: 5, height: 8, scale: 1.35 },
                'garden-flower-2': { x: 49, y: 62, width: 5, height: 8, scale: 0.85 },
                'garden-flower-3': { x: 50, y: 58, width: 5, height: 8, scale: 0.85 },
                'garden-butterfly-1': { x: 20, y: 43, width: 5, height: 8, scale: 1.45 },
                'garden-butterfly-2': { x: 69, y: 38, width: 5, height: 8, scale: 1.45 },
                'garden-butterfly-3': { x: 31, y: 24, width: 4, height: 7, scale: 1.45 },
                'garden-butterfly-4': { x: 63, y: 20, width: 4, height: 7, scale: 1.45 }
            },

            medium: {
                'garden-cactus': { x: 46, y: 42, width: 8, height: 31, scale: 4.9 },
                'garden-branch-1': { x: 48.5, y: 50, width: 9, height: 22, scale: 1.45 },
                'garden-branch-2': { x: 38, y: 56, width: 9, height: 22, scale: 1.45 },
                'garden-branch-3': { x: 50.8, y: 30, width: 9, height: 22, scale: 1.65 },
                'garden-flower-1': { x: 57.8, y: 49, width: 6, height: 10, scale: 1.6 },
                'garden-flower-2': { x: 36, y: 52, width: 6, height: 10, scale: 1.8 },
                'garden-flower-3': { x: 56, y: 25, width: 6, height: 10, scale: 1.6 },
                'garden-butterfly-1': { x: 55, y: 58, width: 5, height: 8, scale: 1.45 },
                'garden-butterfly-2': { x: 35, y: 54, width: 5, height: 8, scale: 1.65 },
                'garden-butterfly-3': { x: 54, y: 34, width: 4, height: 7, scale: 1.6 },
                'garden-butterfly-4': { x: 33, y: 10, width: 4, height: 7, scale: 1.6 }
            },

            complete: {
                'garden-cactus': { x: 46, y: 38, width: 9, height: 35, scale: 5.85 },
                'garden-branch-1': { x: 48, y: 49, width: 11, height: 27, scale: 1.5, rotation: 25 },
                'garden-branch-2': { x: 36, y: 51, width: 11, height: 27, scale: 1.5 },
                'garden-branch-3': { x: 52, y: 25, width: 11, height: 27, scale: 1.9 },
                'garden-flower-1': { x: 60, y: 49, width: 7, height: 12, scale: 1.7 },
                'garden-flower-2': { x: 34, y: 43, width: 7, height: 12, scale: 1.7 },
                'garden-flower-3': { x: 59, y: 29, width: 7, height: 12, scale: 1.7 },
                'garden-butterfly-1': { x: 60, y: 43, width: 5, height: 8, scale: 1.95 },
                'garden-butterfly-2': { x: 33, y: 38, width: 5, height: 8, scale: 1.65 },
                'garden-butterfly-3': { x: 55, y: 22, width: 4, height: 7, scale: 1.6 },
                'garden-butterfly-4': { x: 23, y: 8, width: 4, height: 7, scale: 1.6 }
            },

            common: {
                'garden-ground': { x: 0, y: 66, width: 100, height: 34, scale: 1 },
                'garden-gnome-house': { x: 6, y: 54, width: 26, height: 24, scale: 1 },
                'garden-gnome-path': { x: 5, y: 75, width: 92, height: 22, scale: 1, rotation: 0 },
                'garden-gnome-1': { x: 15, y: 70, width: 8, height: 16, scale: 1 },
                'garden-gnome-2': { x: 34, y: 75, width: 8, height: 16, scale: 1 }
            },

            lake: {
                small: { x: 72, y: 78, width: 16, height: 18, scale: 1 },
                medium: { x: 68, y: 78, width: 27, height: 26, scale: 1 },
                complete: { x: 64, y: 77, width: 32, height: 33, scale: 1 }
            },

            ducks: {
                small: { x: 72, y: 77, width: 7, height: 6, scale: 1 },
                medium: { x: 70, y: 77, width: 11, height: 7, scale: 1 },
                complete: { x: 68, y: 77, width: 16, height: 9, scale: 1 }
            },

            frog: {
                shore: { x: 60, y: 84, width: 8, height: 8, scale: 0.6 },
                lilypad: { x: 70, y: 86, width: 8, height: 8, scale: 0.5 }
            }
        };

    private getDuckStage(
        element: any
    ): 'small' | 'medium' | 'complete' {

        const stage =
            element.stageId ||
            element.variant ||
            'small';

        if (stage === 'medium') {
            return 'medium';
        }

        if (
            stage === 'complete' ||
            stage === 'large'
        ) {
            return 'complete';
        }

        return 'small';
    }

    onElementClick(
        element: any,
        event: MouseEvent
    ): void {

        console.log('CLICK ELEMENTO:', element.id);

        if (this.mode !== 'full') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (element.id === 'garden-frog') {
            this.playFrogSound();
            console.log('CLICK EN LA RANA 🐸');
            this.onFrogClick();
            return;
        }

        if (element.id === 'garden-ducks') {
            this.playDuckSound();
        }

        this.elementClicked.emit(element);
    }

    playDuckClick(event: MouseEvent): void {

        event.stopPropagation();

        this.playDuckSound();
    }

    onFrogClick(): void {

        console.log('SALTO RANA');

        if (this.jumpingFrog) {
            this.playFrogSound();
            return;
        }

        this.jumpingFrog = true;

        console.log('jumpingFrog:', this.jumpingFrog);

        setTimeout(() => {
            this.jumpingFrog = false;
            console.log('FIN SALTO RANA');
        }, 900);
    }

    isInteractiveElement(element: any): boolean {
        const interactiveIds = [
            'garden-cactus',

            'garden-flower-1',
            'garden-flower-2',
            'garden-flower-3',

            'garden-butterfly-1',
            'garden-butterfly-2',
            'garden-butterfly-3',
            'garden-butterfly-4',
            'garden-lake',
            'garden-ducks',
            'garden-frog'
        ];

        return interactiveIds.includes(element.id);
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (changes['mode']) {

            this.updateResponsiveLayout();

            if (this.mode !== 'full') {
                this.stopOwl();
            }
        }

        if (changes['owlMuted']) {

            console.log(
                'GARDEN RECIBE OWL MUTED:',
                this.owlMuted
            );

            if (this.owlMuted) {
                this.stopOwl();
            }
            else if (
                this.mode === 'full' &&
                this.timePhase === 'night'
            ) {
                this.scheduleOwl();
            }
        }

        if (changes['elements']) {
            console.log(
                'ELEMENTOS RECIBIDOS EN GARDEN WORLD:',
                this.elements,
            );


            this.elements.forEach(element => {
                console.log({
                    id: element.id,
                    variant: element.variant,
                    stageId: element.stageId
                });
                console.log(
                    'ELEMENTO:',
                    element.id,
                    'TIPO:',
                    element.type,
                    'STAGE:',
                    element.stageId,
                    'IMAGEN:',
                    element.image,
                    'VISUAL:',
                    element.visual,
                    'CUSTOM VISUAL:',
                    element.customVisual
                );
            });
        }
    }

    getElementSymbol(element: any): string {

        console.log('ELEMENTO:', element);

        if (element.id === 'garden-lake') {
            console.log(
                'LAGO:',
                'stage=', element.stageId,
                'variant=', element.variant
            );
        }

        const symbols: Record<string, string> = {
            'garden-ground': '🌱',
            'garden-cactus': '🌵',
            'garden-branches': '🌿',

            'garden-butterfly-1': '🦋',
            'garden-butterfly-2': '🦋',
            'garden-butterfly-3': '🦋',
            'garden-butterfly-4': '🦋',
            'garden-lake': '💧'
        };

        return symbols[element.id] || '';
    }
    /*✨*/
    getElementClass(element: any): string {
        const classes = [
            'garden-element',
            element.id,
            `stage-${element.stageId || 'default'}`,
            `variant-${element.variant || 'default'}`,
            `animation-${element.animation || 'none'}`
        ];

        return classes.join(' ');
    }

    trackByElementId(
        index: number,
        element: any
    ): string {
        return element.id;
    }

    getElementImage(element: any): string {
        const basePath = 'assets/my-world/garden/';

        switch (element.id) {
            case 'garden-ground':
                return this.mode === 'aside'
                    ? basePath + 'ground.webp'
                    : '';

            case 'garden-cactus':
                switch (element.variant) {
                    case 'seed':
                        return basePath + 'cactus-seed.webp';

                    case 'small':
                        return basePath + 'cactus-small.webp';

                    case 'medium':
                        return basePath + 'cactus-medium.webp';

                    case 'complete':
                        return basePath + 'cactus-large.webp';

                    default:
                        return basePath + 'cactus-seed.webp';
                }

            case 'garden-branch-1':
                return 'assets/my-world/garden/branches/garden-branch-1.webp';

            case 'garden-branch-2':
                return 'assets/my-world/garden/branches/garden-branch-2.webp';

            case 'garden-branch-3':
                return 'assets/my-world/garden/branches/garden-branch-3.webp';

            case 'garden-flower-1':
                return basePath + 'flowers/blue-flower.webp';
            case 'garden-flower-2':
                return basePath + 'flowers/purple-flower.webp';
            case 'garden-flower-3':
                return basePath + 'flowers/red-flower.webp';

            case 'garden-butterfly-1':
                return basePath + 'butterflies/blue-butterfly.webp';
            case 'garden-butterfly-2':
                return basePath + 'butterflies/purple-butterfly.webp';
            case 'garden-butterfly-3':
                return basePath + 'butterflies/red-butterfly.webp';
            case 'garden-butterfly-4':
                return basePath + 'butterflies/orange-butterfly.webp';

            case 'garden-lake':
                switch (element.variant || element.stageId) {
                    case 'small':
                        return basePath + 'lake/lake-small.webp';

                    case 'medium':
                        return basePath + 'lake/lake-medium.webp';

                    case 'complete':
                    case 'large':
                        return basePath + 'lake/lake-complete.webp';

                    default:
                        return basePath + 'lake/lake-small.webp';
                }

            case 'garden-frog': {
                const stage =
                    element.stageId ||
                    element.variant ||
                    'shore';

                switch (stage) {

                    case 'garden-frog':
                        return 'assets/my-world/garden/frog/frog-shore.webp';

                    default:
                        return 'assets/my-world/garden/frog/frog-shore.webp';
                }
            }

            case 'garden-gnome-house': {
                const image =
                    basePath + 'gnomes/gnome-house.webp';

                console.log(
                    'RUTA CASA GNOMOS:',
                    image
                );

                return image;
            }

            case 'garden-gnome-1': {
                const image =
                    basePath + 'gnomes/gnome-1.webp';

                console.log(
                    'RUTA GNOMO 1:',
                    image
                );

                return image;
            }

            case 'garden-gnome-2': {
                const image =
                    basePath + 'gnomes/gnome-2.webp';

                console.log(
                    'RUTA GNOMO 2:',
                    image
                );

                return image;
            }

            default:
                return '';
        }

    }

    getCactusStageClass(): string {
        const cactus = this.elements.find(
            element => element.id === 'garden-cactus'
        );

        const stage = cactus?.stageId || cactus?.variant;

        switch (stage) {
            case 'seed':
            case 'small':
                return 'cactus-small';

            case 'medium':
                return 'cactus-medium';

            case 'complete':
            case 'large':
                return 'cactus-complete';

            default:
                return '';
        }
        console.log(
            'ETAPA CACTUS:',
            cactus?.stageId,
            cactus?.variant
        );
    }

    getElementX(element: any): number {

        if (this.mode === 'aside') {

            const stage =
                this.getNormalizedCactusStage();

            const layout =
                this.asideGardenLayouts[stage]?.[element.id];

            if (layout) {
                return layout.x;
            }

            return element.x;
        }

        const layout = this.getFullLayout(element);

        if (layout) {
            return layout.x;
        }

        const fullPositions: Record<string, number> = {
            'garden-ground': 50,

            'garden-butterfly-1': 19,
            'garden-butterfly-2': 68,
            'garden-butterfly-3': 29,
            'garden-butterfly-4': 61,
            'garden-lake': 80
        };

        return fullPositions[element.id]
            ?? element.x;
    }

    getElementY(element: any): number {

        if (this.mode === 'aside') {

            const stage =
                this.getNormalizedCactusStage();

            const layout =
                this.asideGardenLayouts[stage]?.[element.id];

            if (layout) {
                return layout.y;
            }

            return element.y;
        }

        const layout = this.getFullLayout(element);

        if (layout) {
            return layout.y;
        }

        const fullPositions: Record<string, number> = {
            'garden-ground': 84,

            'garden-butterfly-1': 40,
            'garden-butterfly-2': 35,
            'garden-butterfly-3': 20,
            'garden-butterfly-4': 17,


            'garden-lake': 83
        };

        return fullPositions[element.id]
            ?? element.y;
    }

    getElementWidth(element: any): number {
        const layout = this.getFullLayout(element);

        if (layout) {
            return layout.width;
        }

        return element.width;
    }

    getElementHeight(element: any): number {
        const layout = this.getFullLayout(element);

        if (layout) {
            return layout.height;
        }

        return element.height;
    }

    getElementScale(element: any): number {

        // PREVIEW / ASIDE
        if (this.mode === 'aside') {

            const stage =
                this.getNormalizedCactusStage();

            const layout =
                this.asideGardenLayouts[stage]?.[element.id];

            if (layout?.scale !== undefined) {
                return layout.scale;
            }

            return element.scale ?? 1;
        }

        // PANTALLA COMPLETA
        const layout = this.getFullLayout(element);

        if (layout?.scale !== undefined) {
            return layout.scale;
        }

        return element.scale ?? 1;
    }

    getDucksForStage(
        element: any
    ): Array<{
        image: string;
        className: string;
        delay: number;
        duration: number;
        scale: number;
        rotation?: number;
    }> {
        const stage =
            element.stageId ||
            element.variant ||
            'small';

        const basePath =
            'assets/my-world/garden/ducks/';

        if (stage === 'medium') {
            return [
                {
                    image: basePath + 'duck-male.webp',
                    className: 'duck-male',
                    delay: 0,
                    duration: 14,
                    scale: 1
                },
                {
                    image: basePath + 'duck-female.webp',
                    className: 'duck-female',
                    delay: -1.4,
                    duration: 14,
                    scale: 0.9
                }
            ];
        }

        if (
            stage === 'complete' ||
            stage === 'large'
        ) {
            return [
                {
                    image: basePath + 'duck-male.webp',
                    className: 'duck-male',
                    delay: 0,
                    duration: 16,
                    scale: 1.5
                },
                {
                    image: basePath + 'duck-female.webp',
                    className: 'duck-female',
                    delay: -1.3,
                    duration: 16,
                    scale: 1.4
                },
                {
                    image: basePath + 'duckling.webp',
                    className: 'duckling duckling-1',
                    delay: -3.4,
                    duration: 16,
                    scale: 1
                },
                {
                    image: basePath + 'duckling.webp',
                    className: 'duckling duckling-2',
                    delay: -4,
                    duration: 16,
                    scale: 1
                },
                {
                    image: basePath + 'duckling.webp',
                    className: 'duckling duckling-3',
                    delay: -5.6,
                    duration: 16,
                    scale: 1
                }
            ];
        }

        return [
            {
                image: basePath + 'duck-male.webp',
                className: 'duck-male',
                delay: 0,
                duration: 12,
                scale: 1
            }
        ];
    }

    getElementRotation(element: any): number {
        if (this.mode === 'full') {
            return this.getFullLayout(element)?.rotation
                ?? element.rotation
                ?? 0;
        }

        return element.rotation ?? 0;
    }

    private readonly asideGardenLayouts: Record<
        'small' | 'medium' | 'complete',
        Record<
            string,
            {
                x: number;
                y: number;
                scale?: number;
                rotation?: number;
            }
        >
    > = {

            small: {
                'garden-branch-1': {
                    x: 46,
                    y: 54
                },

                'garden-branch-2': {
                    x: 47,
                    y: 68
                },

                'garden-branch-3': {
                    x: 48,
                    y: 50
                },

                // FLORES
                'garden-flower-1': {
                    x: 63,
                    y: 69,
                    scale: 1.85
                },

                'garden-flower-2': {
                    x: 32,
                    y: 62,
                    scale: 1.85
                },

                'garden-flower-3': {
                    x: 66,
                    y: 36,
                    scale: 1.85
                },

                // MARIPOSAS
                'garden-butterfly-1': {
                    x: 7,
                    y: 43,
                    scale: 1.15
                },

                'garden-butterfly-2': {
                    x: 69,
                    y: 38,
                    scale: 1.15
                },

                'garden-butterfly-3': {
                    x: 31,
                    y: 24,
                    scale: 1.15
                },

                'garden-butterfly-4': {
                    x: 63,
                    y: 20,
                    scale: 0.75
                }
            },

            medium: {
                'garden-branch-1': {
                    x: 49,
                    y: 58
                },

                'garden-branch-2': {
                    x: 33,
                    y: 56
                },

                'garden-branch-3': {
                    x: 56,
                    y: 35
                },

                // FLORES
                'garden-flower-1': {
                    x: 70,
                    y: 69,
                    scale: 2.55
                },

                'garden-flower-2': {
                    x: 32,
                    y: 62,
                    scale: 2.55
                },

                'garden-flower-3': {
                    x: 66,
                    y: 36,
                    scale: 2.55
                },

                // MARIPOSAS
                'garden-butterfly-1': {
                    x: 20,
                    y: 43,
                    scale: 1.95
                },

                'garden-butterfly-2': {
                    x: 69,
                    y: 38,
                    scale: 1.95
                },

                'garden-butterfly-3': {
                    x: 31,
                    y: 24,
                    scale: 1.95
                },

                'garden-butterfly-4': {
                    x: 63,
                    y: 20,
                    scale: 0.95
                }
            },

            complete: {
                'garden-branch-1': {
                    x: 50,
                    y: 52
                },

                'garden-branch-2': {
                    x: 23,
                    y: 51
                },

                'garden-branch-3': {
                    x: 58,
                    y: 21
                },

                // FLORES
                'garden-flower-1': {
                    x: 75,
                    y: 62,
                    scale: 2.55
                },

                'garden-flower-2': {
                    x: 21,
                    y: 52,
                    scale: 2.55
                },

                'garden-flower-3': {
                    x: 75,
                    y: 8,
                    scale: 2.55
                },

                // MARIPOSAS
                'garden-butterfly-1': {
                    x: 20,
                    y: 30,
                    scale: 1.95
                },

                'garden-butterfly-2': {
                    x: 69,
                    y: 30,
                    scale: 1.95
                },

                'garden-butterfly-3': {
                    x: 31,
                    y: 8,
                    scale: 1.95
                },

                'garden-butterfly-4': {
                    x: 23,
                    y: 15,
                    scale: 1.20
                }
            },

        };

    getGnomePathProgress(element: any): number {

        const stage =
            element.stageId ||
            element.variant ||
            'path-1';

        console.log(
            'CAMINO DEBUG:',
            'stageId=', element.stageId,
            'variant=', element.variant,
            'stage usado=', stage
        );

        const progress: Record<string, number> = {
            'path-1': 10,
            'path-2': 20,
            'path-3': 30,
            'path-4': 40,
            'path-5': 50,
            'path-6': 60,
            'path-7': 70,
            'path-8': 80,
            'path-9': 90,
            'complete': 100

        };

        const result = progress[stage] ?? 10;

        console.log(
            'PROGRESO CAMINO:',
            result
        );

        return result;

        return progress[stage] ?? 10;
    }

    getGnomePathClip(element: any): string {

        const progress =
            this.getGnomePathProgress(element);

        const hidden = 100 - progress;

        console.log(
            'CAMINO:',
            element.stageId,
            'VISIBLE:',
            progress,
            'OCULTO:',
            hidden
        );

        return `inset(0 ${hidden}% 0 0)`;
    }

    getVisibleFireflies(): any[] {

        if (this.mode === 'aside') {
            return this.fireflies.slice(0, 6);
        }

        return this.fireflies;
    }


}
