import { boomSpeed } from './config';

export default class Sprint {
    public X: number;
    public Y: number;
    public targetR: number;
    public targetC: number;
    public durationFrames: number;
    public afterboomCb: () => void;
    public afterDropCb: () => void;
    public afterMoveCb: () => void;
    constructor(
        public r: number,
        public c: number,
        public type: string,
        public image: any,
        public offsetR: number,
        public booming: boolean = false,
        public boomF: number = 0,
        public boomImage = global.game.imagesMap.bomb.bomb1.image,
        public dx: number = 0,
        public dy: number = 0,
        public movingVertical: boolean = false,
        public movingHorizontal: boolean = false,
        public movef: number = 0,
        public gforce: number = 0,
        public limitedY: number = 162
    ) {
        this.X = 21 + 45 * c;
        this.Y = 162 + 49 * (r + offsetR);
    }

    public boom(fn) {
        this.booming = true;
        this.afterboomCb = fn;
    }

    public drop(targetR: number, gforce: number, afterDropCb) {
        this.movingVertical = true;
        this.gforce = gforce;
        this.targetR = targetR;
        this.limitedY = 162 + 49 * targetR;
        this.afterDropCb = afterDropCb;
    }

    public moveTo(targetR: number, targetC: number, durationFrames: number, afterMoveCb?) {
        if (this.movingHorizontal) {
            return;
        }

        this.targetR = targetR;
        this.targetC = targetC;
        this.dx = 45 * (targetC - this.c) / durationFrames;
        this.dy = 49 * (targetR - this.r) / durationFrames;
        this.durationFrames = durationFrames;
        this.movef = 0;
        this.afterMoveCb = afterMoveCb;
        this.movingHorizontal = true;
    }

    public render() {
        const G = global.game;

        if (this.booming) {
            G.ctx.drawImage(this.image, this.X, this.Y, 45, 45);
            G.ctx.drawImage(this.boomImage, 200 * (this.boomF % 8), 0, 200, 200, this.X, this.Y, 42, 42);

            if (G.F % boomSpeed === 0) {
                this.boomF++;
                if (this.boomF === 24) {
                    const M = G.scene.map;
                    M.eraseLocations.pop();
                    this.afterboomCb();
                }
            }


        } else {
            G.ctx.drawImage(this.image, this.X, this.Y, 45, 45);

            if (this.movingVertical) {
                this.dy += this.gforce;
                this.Y += this.dy;

                if (this.Y >= this.limitedY) {
                    this.Y = this.limitedY;
                    this.r = this.targetR;
                    this.dy = 0;
                    this.offsetR = 0;
                    this.movingVertical = false;
                    this.afterDropCb();
                }
            } else if (this.movingHorizontal) {
                this.X += this.dx;
                this.Y += this.dy;
                this.movef++;

                if (this.movef === this.durationFrames) {
                    this.movingHorizontal = false;
                    this.dx = 0;
                    this.dy = 0;
                    this.r = this.targetR;
                    this.c = this.targetC;
                    this.afterMoveCb && this.afterMoveCb();
                }
            }

        }
    }
}