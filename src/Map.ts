import Sprint from './Sprint';
import { sample, delay } from './utils';
import { G, offsetR, sprintCount } from './config';

export default class Map {
    public sprintsMatrix: Array<any>;
    public eraseLocations: Array<[number, number]>;
    public memberSprints: Array<any>;
    public minRow: number;

    constructor(
        public col: number = 7,
        public row: number = 7,
        public randomCount: number = sprintCount,
        public gforce: number = G
    ) {
        const { sprint } = global.game.imagesMap;

        this.memberSprints = sample(Object.keys(sprint).map(k => sprint[k]), randomCount);
        this.generateFirstScreenSprintsMatrix();
        // this.setSprintsMatrix(col, row, randomCount);
    }

    public check(matrix?) {
        //console.log('check');
        const eraseLocations = []
            , M = matrix || this.sprintsMatrix
            , uniqueObj = {}
            , maxLineCountMap = {};

        M.forEach((rowSprints, r) => {
            rowSprints.forEach((sprint, c) => {
                if (sprint) {
                    const { type } = sprint;
                    const up1 = M[r - 1] && M[r - 1][c] && M[r - 1][c]['type']
                        , up2 = M[r - 2] && M[r - 2][c] && M[r - 2][c]['type']
                        , down1 = M[r + 1] && M[r + 1][c] && M[r + 1][c]['type']
                        , down2 = M[r + 2] && M[r + 2][c] && M[r + 2][c]['type']
                        , right1 = M[r][c + 1] && M[r][c + 1]['type']
                        , right2 = M[r][c + 2] && M[r][c + 2]['type']
                        , left1 = M[r][c - 1] && M[r][c - 1]['type']
                        , left2 = M[r][c - 2] && M[r][c - 2]['type']

                    if (
                        type === left1 && type === right1
                        || type === up1 && type === down1
                        || type === up2 && type === up1
                        || type === down2 && type === down1
                        || type === right2 && type === right1
                        || type === left2 && type === left1
                    ) {
                        const k = `${r}${c}`;
                        if (!uniqueObj[k]) {
                            uniqueObj[k] = true;
                            eraseLocations.push([r, c]);

                            if (!maxLineCountMap[`r-${r}`]) {
                                maxLineCountMap[`r-${r}`] = 1;
                            } else {
                                maxLineCountMap[`r-${r}`]++;
                            }

                            if (!maxLineCountMap[`c-${c}`]) {
                                maxLineCountMap[`c-${c}`] = 1;
                            } else {
                                maxLineCountMap[`c-${c}`]++;
                            }
                        }
                    }
                }
            });
        });

        //一行或者一列大于4个，消除整行或者整列
        Object.keys(maxLineCountMap).forEach(key => {
            if (maxLineCountMap[key] >= 4) {
                const [t, n] = key.split('-');

                if (t === 'r') {
                    for (let c = 0; c < this.col; c++) {
                        const k = `${t}${c}`;
                        if (!uniqueObj[k]) {
                            uniqueObj[k] = true;
                            eraseLocations.push([n, c]);
                        }
                    }

                } else {
                    for (let r = 0; r < this.col; r++) {
                        const k = `${r}${t}`;
                        if (!uniqueObj[k]) {
                            uniqueObj[k] = true;
                            eraseLocations.push([r, n]);
                        }
                    }

                }
            }
        });

        this.eraseLocations = eraseLocations;
        return eraseLocations;
    }

    private getRamdonMatrix() {
        const typeMatrix = [];

        for (let r = 0; r < this.row; r++) {
            const row = [];
            for (let c = 0; c < this.col; c++) {
                row.push(sample(this.memberSprints));
            }
            typeMatrix.push(row);
        }

        return typeMatrix;
    }

    private generateFirstScreenSprintsMatrix() {
        //初始化首屏不能有能够消除的精灵
        let matrix = this.getRamdonMatrix();
        while (this.check(matrix).length) {
            matrix = this.getRamdonMatrix();
        }

        matrix.forEach((rowSprints, r) => {
            rowSprints.forEach(({ type, image }, c) => {
                matrix[r][c] = new Sprint(r, c, type, image, 0);
            });
        });

        this.sprintsMatrix = matrix;
    }

    public boom() {
        //console.log('boom')
        let count = 0;
        return new Promise(resolve =>
            this.eraseLocations.forEach(([r, c], index) => {
                this.sprintsMatrix[r][c] && this.sprintsMatrix[r][c].boom(() => {
                    count++;
                    if (count === 1) {
                        resolve();
                    }
                    this.sprintsMatrix[r][c] = null;
                });
            })
        );
    }

    public async dropOld() {
        //console.log('drop old');
        let maxGrid = 0;
        const dropGridSet = [];
        this.sprintsMatrix.forEach((rowSprints, r) => {
            rowSprints.forEach((sprint, c) => {
                let grid = 0;
                if (sprint) {
                    for (let i = r + 1; i < this.row; i++) {
                        if (!this.sprintsMatrix[i][c]) {
                            grid++;
                        }
                    }
                }

                if (grid) {
                    if (grid > maxGrid) {
                        maxGrid = grid;
                    }
                    dropGridSet.push([sprint, grid]);
                }
            });
        });

        return new Promise(resolve => {
            if (dropGridSet.length === 0) {
                resolve();
            }

            let count = 0;
            dropGridSet.forEach(([sprint, grid]) => {
                const tatgetR = sprint.r + grid
                    , isSlowest = grid === maxGrid;

                sprint.drop(tatgetR, this.gforce, async () => {

                    if (count === 0 && isSlowest) {
                        count++;
                        await delay(100);
                        this.setSprintsMatrixAfterDropOld();
                        resolve();
                    }
                });
            });
        });

    }

    public supply() {
        //console.log('supply');
        let minRow = Infinity;

        this.sprintsMatrix.forEach((rowSprints, r) => {
            rowSprints.forEach((sprint, c) => {
                if (!sprint) {
                    if (r < minRow) {
                        minRow = r;
                    }
                    const { type, image } = sample(this.memberSprints);

                    this.sprintsMatrix[r][c] = new Sprint(r, c, type, image, offsetR);
                    // console.log(r,c)
                }
            });
        });

        this.minRow = minRow;
    }

    public DropNew() {
        //console.log('drop new');
        let count = 0;
        return new Promise(resolve => {
            this.sprintsMatrix.forEach((rowSprints, r) => {
                rowSprints.forEach(sprint => {
                    if (sprint.offsetR < 0) {
                        const isSlowest = this.minRow === r;
                        sprint.drop(r, this.gforce, () => {
                            if (count === 0 && isSlowest) {
                                count++;
                                resolve();
                            }
                        });
                    }
                });
            });
        });
    }

    private setSprintsMatrixAfterDropOld() {
        //console.log('setSprintsMatrixAfterDropOld')
        const newSprintsMatrix = [];
        for (let r = 0; r < this.row; r++) {
            const row = [];
            for (let c = 0; c < this.col; c++) {
                row.push(null);
            }
            newSprintsMatrix.push(row);
        }

        this.sprintsMatrix.forEach((rowSprint) => {
            rowSprint.forEach((sprint) => {
                if (sprint) {
                    const { r, c } = sprint;
                    newSprintsMatrix[r][c] = sprint;
                }
            });
        });

        this.sprintsMatrix = newSprintsMatrix;
    }


    public exchangePostion([r1, c1], [r2, c2], check?, durationF?) {
        const f = durationF || 10;

        return new Promise(resolve => {
            this.sprintsMatrix[r1][c1].moveTo(r2, c2, f);
            this.sprintsMatrix[r2][c2].moveTo(r1, c1, f, () => {
                let t = this.sprintsMatrix[r1][c1];
                this.sprintsMatrix[r1][c1] = this.sprintsMatrix[r2][c2];
                this.sprintsMatrix[r2][c2] = t;

                if (check) {
                    resolve(this.check().length);
                };
            });
        });
    }

    public render() {
        this.sprintsMatrix.forEach(rowSprints => {
            rowSprints.forEach(sprint => {
                sprint && sprint.render();
            });
        });
    }
}