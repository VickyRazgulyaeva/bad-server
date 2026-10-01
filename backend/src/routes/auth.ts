import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import { generateCsrfToken } from '../middlewares/csrf'

const authRouter = Router()

authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.get('/csrf-token', generateCsrfToken)
authRouter.post('/login', login)
authRouter.get('/token', refreshAccessToken)
authRouter.post('/logout', logout)
authRouter.post('/register', register)

export default authRouter
