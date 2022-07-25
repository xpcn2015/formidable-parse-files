
import fs from 'fs';
const MockExpressRequest = require('mock-express-request');
import FormData from 'form-data';


export const sampleFormWithImageRequest = (() => {
    const form = new FormData();
    form.append('title', "test");
    form.append('images', fs.createReadStream('test/sample.jpg'));
    const request = new MockExpressRequest({
        method: 'POST',
        host: 'localhost',
        url: '/upload',
        headers: form.getHeaders()
    });

    form.pipe(request);

    return request
})()

export const sampleFormWithWrongImageTypeRequest = (() => {
    const form = new FormData();
    form.append('title', "test");
    form.append('images', fs.createReadStream('test/sample.txt'));
    const request = new MockExpressRequest({
        method: 'POST',
        host: 'localhost',
        url: '/upload',
        headers: form.getHeaders()
    });

    form.pipe(request);

    return request
})()