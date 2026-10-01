import { NextFunction, Request, Response } from 'express'
import { readFileSync, unlinkSync } from 'fs'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'

const MIN_FILE_SIZE = 2 * 1024

function isSupportedImage(path: string) {
    const fileBuffer = readFileSync(path)
    const fileStart = fileBuffer.subarray(0, 256)
    const fileStartText = fileStart.toString('utf8').trimStart().toLowerCase()

    const isPng =
        fileBuffer[0] === 0x89 &&
        fileBuffer[1] === 0x50 &&
        fileBuffer[2] === 0x4e &&
        fileBuffer[3] === 0x47
    const isJpeg = fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8
    const isGif =
        fileBuffer.subarray(0, 6).toString('ascii') === 'GIF87a' ||
        fileBuffer.subarray(0, 6).toString('ascii') === 'GIF89a'
    const isSvg = fileStartText.startsWith('<svg')

    return isPng || isJpeg || isGif || isSvg
}

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        if (req.file.size <= MIN_FILE_SIZE) {
            unlinkSync(req.file.path)
            return next(new BadRequestError('Файл слишком маленький'))
        }

        if (!isSupportedImage(req.file.path)) {
            unlinkSync(req.file.path)
            return next(new BadRequestError('Некорректный формат файла'))
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
