import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import BadRequestError from '../errors/bad-request-error'

const CSRF_COOKIE_NAME = 'csrfToken'
const CSRF_HEADER_NAME = 'x-csrf-token'

export function generateCsrfToken(_req: Request, res: Response) {
    const token = crypto.randomBytes(32).toString('hex')

    res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
    })

    res.status(200).json({ csrfToken: token })
}

export function csrfProtection(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS']

    if (safeMethods.includes(req.method)) {
        return next()
    }

    const cookieToken = req.cookies[CSRF_COOKIE_NAME]
    const headerToken = req.header(CSRF_HEADER_NAME)

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return next(new BadRequestError('CSRF token is invalid'))
    }

    return next()
}