import { cleanupFormFile, parseFormFiles, parseFormImage } from '../src/index'

import fs from 'fs';
const MockExpressRequest = require('mock-express-request');
import FormData from 'form-data';


const sampleRequest = (() => {
    const form = new FormData();
    form.append('title', "test");
    form.append('images', fs.createReadStream('test/test.jpg'));
    const request = new MockExpressRequest({
        method: 'POST',
        host: 'localhost',
        url: '/upload',
        headers: form.getHeaders()
    });

    form.pipe(request);

    return request
})()

describe('Simulate form request', () => {
    it('should successfully parse form.', async () => {
        const result = await parseFormImage(sampleRequest, (m) => console.log(m))

        expect(result.fields.title).toBe("test")
        if (!result.files) throw "no file."
        expect(result.files[0].fileName).toBe("test.jpg")

        cleanupFormFile()
    });
})
