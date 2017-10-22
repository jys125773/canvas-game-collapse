export const G = 1;
export const movef = 10;
export const boomSpeed = 2;
export const sprintCount = 6;
export const offsetR = -8;

if (sprintCount <= 2) {
    throw new Error('sprintCount 最好不要小于3，否则会死机');
}

const imageNames = {
    background: ['grid', 'sky'],
    bomb: ['bomb1', 'bomb2'],
    sprint: ['i0', 'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10', 'i11', 'i12', 'i13', 'i14']
};

export const imagesSourceMap = Object.keys(imageNames).reduce((access, key) => {

    access[key] = imageNames[key].map(name => ({ name, url: `/public/images/${name}.png` }));
    return access;
}, {});