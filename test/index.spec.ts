import { cleanupFormFile, parseFormImage } from '../src/index'
import { sampleFormWithImageRequest, sampleFormWithWrongImageTypeRequest } from './sample';


describe('Simulate form request', () => {
    it('should successfully parse form.', async () => {
        const result = await parseFormImage(sampleFormWithImageRequest, (m) => console.log(m))

        expect(result.fields.title).toBe("test")
        if (!result.files) throw "no file."
        expect(result.files[0].fileName).toBe("sample.jpg")

        cleanupFormFile()
    });
    it('should accept only image file.', async () => {
        const result = await parseFormImage(sampleFormWithWrongImageTypeRequest, (m) => console.log(m))

        expect(result.fields.title).toBe("test")
        expect(result.files).toBe(undefined)

        cleanupFormFile()
    });
})
