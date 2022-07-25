import formidable from "formidable";
import { unlink } from "fs";
import { IncomingMessage } from "http";

let tempFiles: string[] = []
const form = new formidable.IncomingForm({ uploadDir: "./temp", keepExtensions: true, multiples: true });

/**
 * parse incoming form
 * 
 * if incoming form has file uploaded, please call function cleanupFormFile()
 * 
 * after processed file to cleanup temporary upload file
 * @param {IncomingMessage} req request from http
 * @returns Promise of Formidable fields and files, or undefined
 */
export function parseFormFiles(req: IncomingMessage) {
    return new Promise<{ fields: formidable.Fields, files: formidable.Files }>((resolve, rejects) => {
        form.parse(req, async (err, fields, files) => {
            if (err) rejects(err)
            tempFiles = getEntriesFilePath(files)
            resolve({ fields, files });
        });
    })
}

/**
 * parse incoming form that have image file 
 * 
 * if incoming form has file uploaded, please call function cleanupFormFile()
 * 
 * after processed file to cleanup temporary upload file
 * @param {IncomingMessage} req request from http
 * @param onError function to handle error
 * @param bodyName image field name from incoming form
 * @returns Promise of Formidable fields and images, or undefined
 */
export function parseFormImage(req: IncomingMessage, onError?: (message: string) => void, bodyName = "images") {
    return new Promise<{ fields: formidable.Fields, files?: fileInfo[] }>((resolve, rejects) => {
        form.parse(req, async (err, fields, files) => {
            if (err) rejects(`Failed to begin parse image => \n${err} `)

            tempFiles = getEntriesFilePath(files)
            const filesInfo = getFilesInfo({
                file: files[bodyName],
                allowedType: ["image/jpeg", "image/jpg", "image/png"],
                onError
            })
            resolve({ fields, files: filesInfo });
        });
    })
}

/**
 * delete current session uploaded files
 * @param onError 
 */
export function cleanupFormFile(onError?: (message: string) => void) {
    tempFiles.forEach(file => {
        unlink(file, (err) => {
            if (err && onError) onError(`Cannot delete temporary uploaded file => \n${err} `);
        })
    })
    tempFiles = []
}



export function getFilesInfo({ file, allowedType, onError }: getFilepathProps) {
    const output: fileInfo[] = []
    if (!file) {
        onError ? onError(`Empty file input`) : null
        return
    }

    const assignOutput = (f: formidable.File) => {
        const fileType = f.mimetype
        if (!fileType) {
            onError ? onError(`Cannot detect file type.`) : null
            return
        }

        if (allowedType.findIndex((el) => el === fileType) === -1) {
            onError ? onError(`Invalid upload file type: \`${fileType}\``) : null
            return
        }
        const fileName = f.originalFilename === null ? "" : f.originalFilename
        output.push({ filePath: f.filepath, fileType: fileType.split('/')[1], fileName: fileName })
    }

    Array.isArray(file) ? file.map(assignOutput) : assignOutput(file)

    if (output.length < 1) {
        onError ? onError(`No file`) : null
        return
    }
    return output


}

function getEntriesFilePath(files: formidable.Files) {
    const output: string[] = []
    Object.entries(files).forEach(file => {
        if (Array.isArray(file[1]))
            file[1].forEach(f => output.push(f.filepath))
        else
            output.push(file[1].filepath)
    })
    return output
}
type getFilepathProps = {
    file: formidable.File | formidable.File[] | undefined,
    allowedType: string[],
    onError?: (message: string) => void

}
type fileInfo = {
    filePath: string,
    fileType: string,
    fileName: string

}