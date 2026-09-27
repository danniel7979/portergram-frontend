import {
    Component,
    Input,
    OnChanges,
    OnInit,
    OnDestroy,
    SimpleChanges
} from '@angular/core';

import {
    CommonModule
} from '@angular/common';


type StadiumLayoutItem = {
    x: number;
    y: number;
    width: number;
    height: number;
    scale?: number;
    rotation?: number;
};


@Component({
    selector: 'app-stadium-world',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: 'stadium-world.html',
    styleUrl: 'stadium-world.css'
})

export class StadiumWorld implements OnChanges, OnInit, OnDestroy {

    ngOnInit(): void {

        console.log('STADIUM ngOnInit');

        this.updateTimePhase();

        this.timeInterval = setInterval(() => {
            this.updateTimePhase();
        }, 60000);
    }


    ngOnDestroy(): void {

        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    }

    public homeScore = 0;
    public awayScore = 0;

    public goalMessage = '';
    public goalAnimation = false;

    scoreLeftGoal(): void {

        // Si entra en la portería izquierda,
        // marca el equipo de la derecha.
        this.awayScore++;

        this.showGoalEffect();
    }


    scoreRightGoal(): void {

        // Si entra en la portería derecha,
        // marca el equipo de la izquierda.
        this.homeScore++;

        this.showGoalEffect();
    }


    private showGoalEffect(): void {

        // 🔊 Sonido del público celebrando el gol
        const goalSound = new Audio(
            'assets/sounds/stadium/goal-crowd.wav'
        );

        goalSound.volume = 0.8;

        goalSound.play().catch(error => {
            console.warn(
                'No se pudo reproducir el sonido de gol:',
                error
            );
        });


        // ⚽ Mensaje de gol
        this.goalMessage = '⚽ ¡GOOOOL!';

        this.goalAnimation = true;


        setTimeout(() => {

            this.goalMessage = '';
            this.goalAnimation = false;

        }, 1200);
    }

    getFireworksForStage(element: any): Array<{
        image: string;
        x: number;
        y: number;
        scale: number;
        delay: number;
    }> {

        const basePath =
            'assets/my-world/stadium/fireworks/';

        const allFireworks = [

            {
                image: basePath + 'firework-red.webp',
                x: 18,
                y: 18,
                scale: 0.7,
                delay: 0
            },

            {
                image: basePath + 'firework-blue.webp',
                x: 82,
                y: 16,
                scale: 0.75,
                delay: 0.4
            },

            {
                image: basePath + 'firework-gold.webp',
                x: 35,
                y: 10,
                scale: 0.9,
                delay: 0.8
            },

            {
                image: basePath + 'firework-purple.webp',
                x: 65,
                y: 9,
                scale: 0.85,
                delay: 1.2
            },

            {
                image: basePath + 'firework-red.webp',
                x: 8,
                y: 38,
                scale: 0.65,
                delay: 1.5
            },

            {
                image: basePath + 'firework-gold.webp',
                x: 92,
                y: 36,
                scale: 0.7,
                delay: 1.8
            },

            {
                image: basePath + 'firework-blue.webp',
                x: 24,
                y: 5,
                scale: 1,
                delay: 2.1
            },

            {
                image: basePath + 'firework-purple.webp',
                x: 76,
                y: 4,
                scale: 1,
                delay: 2.4
            }

        ];

        switch (element.stageId) {

            case 'small':
                return allFireworks.slice(0, 2);

            case 'medium':
                return allFireworks.slice(0, 4);

            case 'large':
                return allFireworks.slice(0, 6);

            case 'complete':
                return allFireworks;

            default:
                return [];
        }
    }


    resetScore(): void {

        this.homeScore = 0;
        this.awayScore = 0;

    }

    public availableFlags = [
        {
            id: 'solaria',
            name: 'Solaria',
            image: 'assets/my-world/stadium/flags/solaria.webp'
        },
        {
            id: 'azur',
            name: 'Azur',
            image: 'assets/my-world/stadium/flags/azur.webp'
        },
        {
            id: 'antin',
            name: 'antin',
            image: 'assets/my-world/stadium/flags/antin.webp'
        },
        {
            id: 'roazne',
            name: 'roazne',
            image: 'assets/my-world/stadium/flags/roazne.webp'
        },
        {
            id: 'ronea',
            name: 'ronea',
            image: 'assets/my-world/stadium/flags/ronea.webp'
        }
    ];

    public leftFlagId = 'solaria';
    public rightFlagId = 'azur';

    public selectingFlagSide:
        'left' | 'right' | null = null;

    public showFlagSelector = false;

    getFlagImage(flagId: string): string {

        const flag =
            this.availableFlags.find(
                item => item.id === flagId
            );

        return flag?.image || '';
    }


    openFlagSelector(
        side: 'left' | 'right'
    ): void {

        this.selectingFlagSide = side;
        this.showFlagSelector = true;
    }


    closeFlagSelector(): void {

        this.showFlagSelector = false;
        this.selectingFlagSide = null;
    }


    selectFlag(flagId: string): void {

        if (this.selectingFlagSide === 'left') {
            this.leftFlagId = flagId;
        }

        if (this.selectingFlagSide === 'right') {
            this.rightFlagId = flagId;
        }

        this.closeFlagSelector();
    }

    public timePhase:
        'dawn' |
        'day' |
        'sunset' |
        'night' = 'day';

    private updateTimePhase(): void {

        const hour = new Date().getHours();

        if (hour >= 6 && hour < 8) {
            this.timePhase = 'dawn';
            return;
        }

        if (hour >= 8 && hour < 19) {
            this.timePhase = 'day';
            return;
        }

        if (hour >= 19 && hour < 21) {
            this.timePhase = 'sunset';
            return;
        }

        this.timePhase = 'night';

        console.log(
            'STADIUM TIME:',
            hour,
            this.timePhase
        );
    }

    private timeInterval: any = null;

    @Input() elements: any[] = [];

    @Input()
    mode: 'aside' | 'full' = 'aside';


    // =====================================================
    // LAYOUT ASIDE
    // =====================================================

    private readonly asideStadiumLayout:
        Record<string, StadiumLayoutItem> = {

            'stadium-ground': {
                x: 63.5,
                y: 53,
                width: 120,
                height: 30,
                scale: 1.2
            },

            'stadium-stands': {
                x: 80,
                y: 65,
                width: 80,
                height: 34,
                scale: 1.7
            },

            'stadium-crowd': {
                x: 80,
                y: 65,
                width: 80,
                height: 34,
                scale: 1.7
            },

            'stadium-lights': {
                x: 50,
                y: 31,
                width: 95,
                height: 62,
                scale: 1
            },

            'stadium-scoreboard': {
                x: 50,
                y: 23,
                width: 28,
                height: 18,
                scale: 1
            },

            'stadium-flags': {
                x: 50,
                y: 28,
                width: 95,
                height: 55,
                scale: 1
            },

            'stadium-fireworks': {
                x: 50,
                y: 15,
                width: 100,
                height: 45,
                scale: 1
            }

        };


    // =====================================================
    // LAYOUT PANTALLA COMPLETA
    // =====================================================

    private readonly fullStadiumLayout:
        Record<string, StadiumLayoutItem> = {

            'stadium-ground': {
                x: 50,
                y: 86,
                width: 100,
                height: 30,
                scale: 1
            },

            'stadium-stands': {
                x: 50,
                y: 49,
                width: 128,
                height: 88,
                scale: 1.5
            },

            'stadium-crowd': {
                x: 50,
                y: 47,
                width: 84,
                height: 46,
                scale: 1
            },

            'stadium-lights': {
                x: 50,
                y: 27,
                width: 96,
                height: 68,
                scale: 1
            },

            'stadium-scoreboard': {
                x: 50,
                y: 19,
                width: 24,
                height: 16,
                scale: 1
            },

            'stadium-flags': {
                x: 50,
                y: 24,
                width: 96,
                height: 58,
                scale: 1
            },

            'stadium-fireworks': {
                x: 50,
                y: 12,
                width: 100,
                height: 50,
                scale: 1
            }

        };


    // =====================================================
    // CAMBIOS
    // =====================================================

    ngOnChanges(changes: SimpleChanges): void {

        if (changes['elements']) {

            console.log(
                'ELEMENTOS RECIBIDOS EN STADIUM WORLD:',
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
    // TRACK BY
    // =====================================================

    trackByElementId(
        index: number,
        element: any
    ): string {

        return element.id;
    }


    // =====================================================
    // CLASES
    // =====================================================

    getElementClass(element: any): string {

        const classes = [
            'stadium-element',
            element.id,
            `stage-${element.stageId || 'default'}`,
            `variant-${element.variant || 'default'}`,
            `animation-${element.animation || 'none'}`
        ];

        return classes.join(' ');
    }


    // =====================================================
    // IMÁGENES
    // =====================================================

    getElementImage(element: any): string | null {

        const basePath = 'assets/my-world/stadium/';

        switch (element.id) {

            // =========================
            // GROUND
            // =========================

            case 'stadium-ground':
                return basePath + 'ground.webp';


            // =========================
            // STANDS
            // =========================

            case 'stadium-stands':

                // =========================
                // ASIDE
                // =========================

                if (this.mode === 'aside') {

                    switch (element.stageId) {

                        case 'small':
                        case 'medium':
                            return basePath +
                                'stands/stands-small.webp';

                        case 'large':
                        case 'complete':
                            return basePath +
                                'stands/stands-complete.webp';

                        default:
                            return null;
                    }
                }


                // =========================
                // FULL
                // =========================

                switch (element.stageId) {

                    case 'small':
                        return basePath +
                            'stands/stands-small.webp';

                    case 'medium':
                        return basePath +
                            'stands/stands-medium.webp';

                    case 'large':
                        return basePath +
                            'stands/stands-large.webp';

                    case 'complete':
                        return basePath +
                            'stands/stands-complete.webp';

                    default:
                        return null;
                }

            // =========================
            // CROWD
            // =========================

            case 'stadium-crowd':

                switch (element.stageId) {

                    case 'small':
                        return basePath +
                            'crowd/crowd-small.webp';

                    case 'medium':
                        return basePath +
                            'crowd/crowd-medium.webp';

                    case 'large':
                        return basePath +
                            'crowd/crowd-large.webp';

                    case 'full':
                        return basePath +
                            'crowd/crowd-large.webp';

                    case 'complete':
                        return basePath +
                            'crowd/crowd-complete.webp';

                    default:
                        return null;
                }

            case 'stadium-fireworks':

                switch (element.stageId) {

                    case 'small':
                        return basePath + 'fireworks/fireworks-small.webp';

                    case 'medium':
                        return basePath + 'fireworks/fireworks-medium.webp';

                    case 'large':
                        return basePath + 'fireworks/fireworks-large.webp';

                    case 'complete':
                        return basePath + 'fireworks/fireworks-complete.webp';

                    default:
                        return null;
                }


            default:
                return null;
        }
    }

    private getElementLayout(
        element: any
    ): StadiumLayoutItem | null {

        if (this.mode === 'aside') {

            return (
                this.asideStadiumLayout[element.id] ||
                null
            );

        }

        return (
            this.fullStadiumLayout[element.id] ||
            null
        );
    }


    // =====================================================
    // POSICIÓN X
    // =====================================================

    getElementX(element: any): number {

        const layout =
            this.getElementLayout(element);

        if (layout) {
            return layout.x;
        }

        return element.x ?? 50;
    }


    // =====================================================
    // POSICIÓN Y
    // =====================================================

    getElementY(element: any): number {

        const layout =
            this.getElementLayout(element);

        if (layout) {
            return layout.y;
        }

        return element.y ?? 50;
    }


    // =====================================================
    // ANCHO
    // =====================================================

    getElementWidth(element: any): number {

        const layout =
            this.getElementLayout(element);

        if (layout) {
            return layout.width;
        }

        return element.width ?? 20;
    }


    // =====================================================
    // ALTO
    // =====================================================

    getElementHeight(element: any): number {

        const layout =
            this.getElementLayout(element);

        if (layout) {
            return layout.height;
        }

        return element.height ?? 20;
    }


    // =====================================================
    // ESCALA
    // =====================================================

    getElementScale(element: any): number {

        const layout =
            this.mode === 'aside'
                ? this.asideStadiumLayout[element.id]
                : this.fullStadiumLayout[element.id];

        return layout?.scale ?? 1;
    }


    // =====================================================
    // ROTACIÓN
    // =====================================================

    getElementRotation(element: any): number {

        const layout =
            this.getElementLayout(element);

        if (
            layout &&
            layout.rotation !== undefined
        ) {

            return layout.rotation;
        }

        return element.rotation ?? 0;
    }

    shouldRenderElement(element: any): boolean {

        if (element.id === 'stadium-ground') {

            const standsUnlocked =
                this.elements.some(
                    item =>
                        item.id === 'stadium-stands'
                );

            if (standsUnlocked) {
                return false;
            }
        }

        if (element.id === 'stadium-stands') {

            const crowdUnlocked =
                this.elements.some(
                    item =>
                        item.id === 'stadium-crowd'
                );

            return !crowdUnlocked;
        }

        if (element.id === 'stadium-lights') {
            return this.timePhase === 'night';
        }


        return true;

        // Si ya existe público desbloqueado,
        // su PNG ya contiene las gradas.
        if (element.id === 'stadium-stands') {

            const crowdUnlocked =
                this.elements.some(
                    item =>
                        item.id === 'stadium-crowd'
                );

            return !crowdUnlocked;
        }

        if (element.id === 'stadium-lights') {

            return this.timePhase === 'night';
        }

        return true;

    }

    getTrophiesForStage(element: any): Array<{
        image: string;
        x: number;
        y: number;
        scale: number;
    }> {

        const basePath =
            'assets/my-world/stadium/trophies/';

        const trophies = [

            {
                image: basePath + 'copa-nacional.webp',
                x: 15,
                y: 24,
                scale: 0.55
            },

            {
                image: basePath + 'copa-continental.webp',
                x: 25,
                y: 41,
                scale: 0.7
            },

            {
                image: basePath + 'supercopa-continental.webp',
                x: 15,
                y: 64,
                scale: 0.78
            },

            {
                image: basePath + 'copa-mundial.webp',
                x: 82,
                y: 65,
                scale: 1.7
            }

        ];

        switch (element.stageId) {

            case 'small':
                return trophies.slice(0, 1);

            case 'medium':
                return trophies.slice(0, 2);

            case 'large':
                return trophies.slice(0, 3);

            case 'complete':
                return trophies;

            default:
                return [];
        }
    }

    getStadiumLightIntensity(element: any): number {

        switch (element.stageId) {

            case 'small':
                return 0.30;

            case 'medium':
                return 0.45;

            case 'large':
                return 0.65;

            case 'complete':
                return 0.85;

            default:
                return 0;
        }
    }

    getElementZIndex(element: any): number {

        switch (element.id) {

            case 'stadium-lights':
                return 1;

            case 'stadium-ground':
                return 2;

            case 'stadium-stands':
                return 4;

            case 'stadium-crowd':
                return 5;

            case 'stadium-scoreboard':
                return 6;

            case 'stadium-flags':
                return 7;

            case 'stadium-fireworks':
                return 10;

            default:
                return element.layer ?? 1;
        }
    }

}