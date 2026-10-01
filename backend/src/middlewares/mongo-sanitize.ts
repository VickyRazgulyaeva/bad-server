import { NextFunction, Request, Response } from 'express'
import BadRequestError from '../errors/bad-request-error'

function hasDangerousKeys(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
        return false
    }

    return Object.entries(value).some(
    ([key, nestedValue]) =>
        key.includes('$') ||
        key.includes('.') ||
        hasDangerousKeys(nestedValue)
)
}

export default function mongoSanitize(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    if (
        hasDangerousKeys(req.body) ||
        hasDangerousKeys(req.query) ||
        hasDangerousKeys(req.params)
    ) {
        return next(new BadRequestError('Недопустимые символы в запросе'))
    }

    return next()
}