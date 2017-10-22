const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

const imageNames = {
    background: ['grid', 'sky'],
    bomb: ['bomb1', 'bomb2'],
    sprint: ['i0', 'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10', 'i11', 'i12', 'i13', 'i14']
};

const imagesMap = Object.entries(imageNames).reduce((access, [key, list]) => {
    access[key] = list.map(name => ({ name, url: `/public/images/${name}.png` }));
    return access;
}, {});

app.get('/api/images', (req, res) => {
    res.json(imagesMap);
});

app.listen(8000, err => {
    if (err) {
        console.log(err.message);
    } else {
        console.log(`server is running at "127.0.0.1:8000"`);
    }
});