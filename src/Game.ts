import Scene from './Scene';
import { sample } from './utils';
import { imagesSourceMap } from './config';

interface imagesInterface {
    [prop: string]: {
        type: string,
        image: any
    }
}

interface imagesMapInterface {
    background: imagesInterface,
    bomb: imagesInterface,
    sprint: imagesInterface
};

enum BACKGROUNDS {
    sky = 1,
    grid
};

export default class Game {
    readonly canvas: any;
    readonly ctx: any;
    public scene: any;
    public imagesMap: any;
    public FSM: string;

    constructor(
        { containerId, sourceUrl }: { containerId: string, sourceUrl: string },
        public F: number = 0,
        public backImage = BACKGROUNDS[2]
    ) {
        this.canvas = document.querySelector(containerId);
        this.ctx = this.canvas.getContext("2d");

        this.loadSource(sourceUrl)
            .then(imagesMap => {
                this.imagesMap = imagesMap;
                this.start();

                // console.log(imagesMap)
            });
    }

    private drawText(message?: string, x?: number, y?: number): void {
        const { width: w, height: h } = this.canvas;

        this.ctx.clearRect(0, 0, w, h);
        message && this.ctx.fillText(message, x || w * 0.5, y || h * 0.382);
    }

    private drawBackground(): void {
        const { width: w, height: h } = this.canvas
            , backImage = this.imagesMap.background[this.backImage].image;

        this.ctx.drawImage(backImage, 0, 0, w, h);
    }

    private loadImage(url: string) {
        const theImage = new Image();
        theImage.src = url;

        return new Promise((resolve, reject) => {
            theImage.addEventListener('load', () => resolve(theImage));
            theImage.addEventListener('error', err => reject(err));
        });
    }

    private async loadSource(sourceUrl: string) {
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.drawText('开始加载...');

        // let source;
        // try {
        //     source = await fetch(sourceUrl).then(res => res.json());
        // } catch (error) {
        //     console.log(error);
        //     this.drawText('网络请求错误');
        // }

        const imagesMap = {};
        const promises = Object.keys(imagesSourceMap).reduce((acc, k) => {
            imagesSourceMap[k].forEach(({ name, url }) => {
                const p = this.loadImage(url)
                    .then(image => {
                        const t = { image, type: name };

                        if (imagesMap[k]) {
                            imagesMap[k][name] = t;
                        } else {
                            imagesMap[k] = { [name]: t };
                        }

                        this.drawText(`图片${name}加载成功`);
                    })
                    .catch(error => this.drawText(`图片${name}加载失败`));

                acc.push(p);
            });
            return acc;
        }, []);

        try {
            await Promise.all(promises);
            return imagesMap;
        } catch (error) {
            console.log(error);
        }
    }

    private start() {
        this.scene = new Scene();
        this.loop();
    }

    private loop() {
        this.F++;
        this.drawBackground();
        this.scene.render();
        window.requestAnimationFrame(() => this.loop());
    }
}