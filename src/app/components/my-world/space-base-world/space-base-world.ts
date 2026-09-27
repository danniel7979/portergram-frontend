import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges
} from '@angular/core';

import {
    CommonModule
} from '@angular/common';



type SpaceLayoutItem = {
    x: number;
    y: number;
    width: number;
    height: number;
    scale?: number;
    rotation?: number;
};


@Component({
    selector: 'app-space-base-world',

    standalone: true,

    imports: [
        CommonModule
    ],

    templateUrl: 'space-base-world.html',

    styleUrl: 'space-base-world.css'
})


export class SpaceBaseWorld implements OnChanges, OnInit {


    public rocketLaunching = false;
    public ufoFlying = false;
    public planetRotation = 0;

    // =====================================================
    // INPUTS
    // =====================================================

    @Input()
    elements: any[] = [];

    @Input()
    mode: 'aside' | 'full' = 'aside';

    private updatePlanetRotation(): void {

        const now = new Date();

        const hours =
            now.getHours() +
            now.getMinutes() / 60;

        const dayFactor =
            now.getDate();

        this.planetRotation =
            ((hours * 15) + (dayFactor * 12)) % 360;
    }


    // =====================================================
    // LAYOUT ASIDE
    // =====================================================

    private readonly asideSpaceLayout:
        Record<string, SpaceLayoutItem> = {

            'space-ground': {
                x: 50,
                y: 83,
                width: 120,
                height: 38,
                scale: 1
            },

            'space-rocket': {
                x: 72,
                y: 77,
                width: 24,
                height: 52,
                scale: 1
            },

            'space-base': {
                x: 32,
                y: 80,
                width: 42,
                height: 38,
                scale: 1.2
            },

            'space-ufo': {
                x: 31,
                y: 22,
                width: 31,
                height: 21,
                scale: 1
            }

        };


    // =====================================================
    // LAYOUT FULL
    // =====================================================

    private readonly fullSpaceLayout:
        Record<string, SpaceLayoutItem> = {

            'space-ground': {
                x: 91,
                y: 87,
                width: 110,
                height: 38,
                scale: 1.75
            },

            'space-rocket': {
                x: 78,
                y: 60,
                width: 18,
                height: 48,
                scale: 1
            },

            'space-base': {
                x: 37,
                y: 70,
                width: 35,
                height: 38,
                scale: 1
            },

            'space-ufo': {
                x: 67,
                y: 20,
                width: 25,
                height: 18,
                scale: 1
            },

            'space-rover': {
                x: 18,
                y: 84,
                width: 18,
                height: 15,
                scale: 1.5
            },

            'space-satellite': {
                x: 30,
                y: 24,
                width: 16,
                height: 17,
                scale: 1
            },

            'space-astronauts': {
                x: 58,
                y: 82,
                width: 18,
                height: 27,
                scale: 1
            },

        };

    ngOnInit(): void {

        this.updatePlanetRotation();

    }


    // =====================================================
    // CHANGES
    // =====================================================

    ngOnChanges(changes: SimpleChanges): void {

        if (changes['elements']) {

            console.log(
                'ELEMENTOS RECIBIDOS EN SPACE BASE WORLD:',
                this.elements
            );

            this.elements.forEach(element => {

                console.log({
                    id: element.id,
                    stageId: element.stageId,
                    variant: element.variant,
                    animation: element.animation
                });

            });

        }

    }


    // =====================================================
    // IMÁGENES
    // =====================================================

    getElementImage(element: any): string | null {

        const basePath =
            'assets/my-world/space-base/';


        switch (element.id) {


            // =============================================
            // GROUND
            // =============================================

            case 'space-ground':

                return basePath + 'ground.webp';


            // =============================================
            // ROCKET
            // =============================================

            case 'space-rocket':

                switch (element.stageId) {

                    case 'small':
                        return basePath +
                            'rocket/rocket-small.webp';

                    case 'medium':
                        return basePath +
                            'rocket/rocket-medium.webp';

                    case 'large':
                        return basePath +
                            'rocket/rocket-large.webp';

                    case 'complete':
                        return basePath +
                            'rocket/rocket-complete.webp';

                    default:
                        return null;
                }


            // =============================================
            // BASE
            // =============================================

            case 'space-base':

                switch (element.stageId) {

                    case 'small':
                        return basePath +
                            'base/base-small.webp';

                    case 'medium':
                        return basePath +
                            'base/base-medium.webp';

                    case 'large':
                        return basePath +
                            'base/base-large.webp';

                    case 'complete':
                        return basePath +
                            'base/base-complete.webp';

                    default:
                        return null;
                }


            // =============================================
            // UFO
            // =============================================

            case 'space-ufo':

                return basePath + 'ufo/ufo.webp';

            // =============================================
            // ROVER
            // =============================================

            case 'space-rover':

                switch (element.stageId) {

                    case 'small':
                        return basePath + 'rover/rover-small.webp';

                    case 'medium':
                        return basePath + 'rover/rover-medium.webp';

                    case 'large':
                        return basePath + 'rover/rover-large.webp';

                    case 'complete':
                        return basePath + 'rover/rover-complete.webp';

                    default:
                        return null;
                }


            // =============================================
            // SATELLITE
            // =============================================

            case 'space-satellite':

                switch (element.stageId) {

                    case 'small':
                        return basePath + 'satellite/satellite-small.webp';

                    case 'medium':
                        return basePath + 'satellite/satellite-medium.webp';

                    case 'large':
                        return basePath + 'satellite/satellite-large.webp';

                    case 'complete':
                        return basePath + 'satellite/satellite-complete.webp';

                    default:
                        return null;
                }


            // =============================================
            // ASTRONAUTS
            // =============================================

            case 'space-astronauts':

                switch (element.stageId) {

                    case 'small':
                        return basePath + 'astronauts/astronauts-small.webp';

                    case 'medium':
                        return basePath + 'astronauts/astronauts-medium.webp';

                    case 'large':
                        return basePath + 'astronauts/astronauts-large.webp';

                    case 'complete':
                        return basePath + 'astronauts/astronauts-complete.webp';

                    default:
                        return null;
                }


            default:
                return null;
        }
    }


    private getStageImage(
        basePath: string,
        folder: string,
        stageId: string
    ): string | null {

        switch (stageId) {

            case 'small':
            case 'medium':
            case 'large':
            case 'complete':

                return (
                    basePath +
                    folder +
                    '/' +
                    folder +
                    '-' +
                    stageId +
                    '.webp'
                );

            default:
                return null;
        }

    }


    // =====================================================
    // LAYOUT
    // =====================================================

    private getElementLayout(
        element: any
    ): SpaceLayoutItem | null {

        if (this.mode === 'aside') {

            return (
                this.asideSpaceLayout[element.id] ||
                null
            );

        }

        return (
            this.fullSpaceLayout[element.id] ||
            null
        );
    }


    getElementX(element: any): number {

        const layout =
            this.getElementLayout(element);

        return layout?.x ?? element.x ?? 50;
    }


    getElementY(element: any): number {

        const layout =
            this.getElementLayout(element);

        return layout?.y ?? element.y ?? 50;
    }


    getElementWidth(element: any): number {

        const layout =
            this.getElementLayout(element);

        return layout?.width ?? element.width ?? 20;
    }


    getElementHeight(element: any): number {

        const layout =
            this.getElementLayout(element);

        return layout?.height ?? element.height ?? 20;
    }


    getElementScale(element: any): number {

        const layout =
            this.getElementLayout(element);

        return layout?.scale ?? 1;
    }


    // =====================================================
    // RENDER
    // =====================================================

    shouldRenderElement(element: any): boolean {

        /*
         * El backend ya manda al componente los elementos
         * correspondientes al modo actual.
         *
         * Esta función nos permite añadir excepciones
         * visuales más adelante.
         */

        return true;
    }


    // =====================================================
    // Z INDEX
    // =====================================================

    getElementZIndex(element: any): number {

        switch (element.id) {

            case 'space-ground':
                return 1;

            case 'space-solar-panels':
                return 2;

            case 'space-base':
                return 4;

            case 'space-rover':
                return 5;

            case 'space-astronauts':
                return 6;

            case 'space-rocket':
                return 7;

            case 'space-antenna':
                return 8;

            case 'space-portal':
                return 9;

            case 'space-satellite':
                return 10;

            case 'space-ufo':
                return 11;

            default:
                return element.layer ?? 1;
        }

    }

    onElementClick(
        element: any,
        event: MouseEvent
    ): void {

        event.stopPropagation();

        switch (element.id) {

            case 'space-rocket':
                this.launchRocket();
                break;

            case 'space-ufo':
                this.flyUfo();
                break;
        }
    }

    flyUfo(): void {

        if (this.ufoFlying) {
            return;
        }

        this.ufoFlying = true;

        setTimeout(() => {

            this.ufoFlying = false;

        }, 3200);
    }

    launchRocket(): void {

        if (this.rocketLaunching) {
            return;
        }

        this.rocketLaunching = true;

        setTimeout(() => {

            this.rocketLaunching = false;

        }, 3200);
    }
}