import Map from './Map';
import { delay } from './utils';
import { movef } from './config';

enum MODES {
    STABLE,//静稳状态
    CHECK,//检查状态，检查哪些精灵应该被消除
    BOOM,//消除爆炸状态
    DROP_OLD,
    SUPPLY,//补充状态
    DROP_NEW,//新精灵下落
}

export default class Scene {
    public map: any;
    public stateNum: number = 1;
    public FSM: number;
    constructor() {
        this.switchScene(1);
        this.bindEvent();
    }

    private switchScene(stateNum: number) {
        const G = global.game;

        switch (stateNum) {
            //1游戏过程
            case 1:
                this.FSM = MODES['CHECK'];
                this.map = new Map();
                break;
            default:
                break;
        }
    }

    private bindEvent() {
        const G = global.game
            , C = G.canvas;

        let theSprint: any;
        C.onmousedown = event => {
            let x0 = event.offsetX,
                y0 = event.offsetY,
                c0 = Math.floor((x0 - 21) / 45),
                r0 = Math.floor((y0 - 162) / 49);

            const matrix = this.map.sprintsMatrix;
            theSprint = matrix[r0] && matrix[r0][c0];

            if (this.FSM !== MODES['STABLE'] || !theSprint || !theSprint.type) {
                return;
            }

            let count = 0;
            C.onmousemove = ({ offsetX, offsetY }) => {
                count++;
                if (count <= 5) return;
                //降低灵敏度
                if (Math.abs(offsetX - x0) / Math.abs(offsetY - y0) >= 3) {
                    const offsetCol = offsetX - x0 > 0 ? 1 : -1;
                    let c = c0 + offsetCol;

                    if (c >= 0 && c <= 6) {
                        this.handleDragSprint([r0, c0], [r0, c]);
                    }


                } else if (Math.abs(offsetY - y0) / Math.abs(offsetX - x0) >= 3) {
                    const offsetRow = offsetY - y0 > 0 ? 1 : -1;
                    let r = r0 + offsetRow;

                    if (r >= 0 && r <= 6) {
                        this.handleDragSprint([r0, c0], [r, c0]);
                    }

                }

            };
        };

        document.onmouseup = () => C.onmousemove = null;
    }

    async handleDragSprint([r1, c1], [r2, c2]) {
        const eraseLen = await this.map.exchangePostion([r1, c1], [r2, c2], true);

        if (eraseLen) {
            this.FSM = MODES['BOOM'];
        } else {
            await delay(80);
            //停顿
            this.map.exchangePostion([r2, c2], [r1, c1], false);
        }

    }

    public async render() {
        const G = global.game;

        switch (this.stateNum) {
            case 1:
                this.map.render();

                if (this.FSM === MODES['CHECK']) {
                    const eraseCount = this.map.check().length;
                    this.FSM = eraseCount ? MODES['BOOM'] : MODES['SUPPLY'];

                } else if (this.FSM === MODES['BOOM']) {
                    this.FSM = MODES['STABLE'];
                    await this.map.boom();
                    this.FSM = MODES['DROP_OLD'];

                } else if (this.FSM === MODES['DROP_OLD']) {
                    this.FSM = MODES['STABLE'];
                    await this.map.dropOld();
                    this.FSM = MODES['CHECK'];

                } else if (this.FSM === MODES['SUPPLY']) {
                    this.map.supply();
                    this.FSM = MODES['DROP_NEW'];

                } else if (this.FSM === MODES['DROP_NEW']) {
                    this.FSM = MODES['STABLE'];
                    await this.map.DropNew();
                    this.FSM = MODES['CHECK'];

                } else if (this.FSM === MODES['STABLE']) {

                }

                break;

            default:
                break;
        }
    }
}