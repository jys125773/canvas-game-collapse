export function sample(list: Array<any>, n?: number) {
    if (n === 0) {
        return [];
    }

    if (!n) {
        return list[Math.floor(Math.random() * list.length)];
    }

    if (n === 1) {
        const item = list[Math.floor(Math.random() * list.length)];
        return [item];
    }

    const sampleList = []
        , len = list.length
        , template = {};

    while (sampleList.length < n) {
        const i = Math.floor(Math.random() * len);

        if (!template[i]) {
            template[i] = true;
            sampleList.push(list[i]);
        }
    }

    return sampleList;
}

let timer: any = null;
export function delay(duration: number = 0) {
    return new Promise(resolve => {
        clearInterval(timer);
        timer = setTimeout(resolve, duration);
    });
}