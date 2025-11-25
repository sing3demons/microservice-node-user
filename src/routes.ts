import { Router } from 'express'
import UsersController from './controller/users.controller'

import { upload } from './utils/upload'
import JWTTokens from './utils/jwt'
import UsersService from './services/users.service'
import UsersRepository from './repositories/users.repository'

const router = Router({ caseSensitive: true })
const usersRepository = new UsersRepository()
const usersService = new UsersService(usersRepository)
const usersController = new UsersController(usersService)
const verifyToken = JWTTokens.verifyToken

router.post('/auth/register', usersController.register)
router.post('/auth/sign-in', usersController.login)

router.get('/users', verifyToken, usersController.getUsers)

router.get('/users/:id', verifyToken, usersController.getUserById)
router.get('/users/profile', verifyToken, usersController.getUserById)

router.put('/users/:id', verifyToken, usersController.updateUser)
router.patch(
  '/users/:id/profile',
  verifyToken,
  upload.single('avatar'),
  usersController.uploadProfile
)

router.delete('/users/:id', verifyToken, usersController.deleteUser)

export default router
