import { Request, Response } from 'express'
import { IUsersService } from '../services/users.service'

import {
  Login,
  LoginRequest,
  RequestQuery,
  User,
  Profile,
  UserRequest,
  UsersResponse
} from '../dto/users'

import JSONResponse from '../utils/response'
import { TokenData, TokenDt } from '../dto/jwt'

class UsersController {
  constructor(private readonly usersService: IUsersService) { }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = UserRequest.parse(req.body) as User
      const newUser: User = await this.usersService.register(body)
      JSONResponse.success(req, res, 'success', newUser)
    } catch (e) {
      JSONResponse.serverError(req, res)
    }
  }

  public getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: RequestQuery = req.query

      const users: UsersResponse = await this.usersService.getUsers(query)
      JSONResponse.success(req, res, 'success', users)
    } catch (e) {
      JSONResponse.serverError(req, res)
    }
  }

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId }: any = req.user
      if (!userId) {
        JSONResponse.unauthorized(req, res, 'unauthorized')
        return
      }

      if (!req.params.id || req.params.id === 'profile') {
        req.params.id = userId
      }

      const { id } = req.params

      const user: User | null = await this.usersService.getUserById(id)
      if (!user) {
        JSONResponse.notFound(req, res, 'user not found')
        return
      }
      JSONResponse.success(req, res, 'success', user)
    } catch (e) {
      JSONResponse.serverError(req, res)
    }
  }

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const userUpdate: User = req.body
      const user: User = await this.usersService.updateUser(id, userUpdate)
      JSONResponse.success(req, res, 'success', user)
    } catch (e) {
      JSONResponse.serverError(req, res)
    }
  }

  private readonly requestToken = (req: Request): TokenDt => {
    const reqToken = req as TokenData
    return reqToken?.user as TokenDt
  }

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId }: TokenDt = this.requestToken(req)

      if (!userId) {
        JSONResponse.unauthorized(req, res, 'unauthorized')
        return
      }
      const { id } = req.params
      if (userId !== id) {
        JSONResponse.forbidden(req, res, 'forbidden')
        return
      }
      const user: User = await this.usersService.deleteUser(id)
      JSONResponse.success(req, res, 'success', user)
    } catch (e) {
      JSONResponse.serverError(req, res)
    }
  }

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = LoginRequest.parse(req.body) as Login
      const token = await this.usersService.login(body.email, body.password)

      JSONResponse.success(req, res, 'success', token)
    } catch (e) {
      if (e instanceof Error) {
        JSONResponse.unauthorized(req, res, 'unauthorized')
        return
      }
      JSONResponse.serverError(req, res, 'system error')
    }
  }
  public uploadProfile = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const body: User = Profile.parse(req.body) as User

      if (req.file?.filename) {
        body.profile = 'images/' + req.file?.filename
      }

      if (body?.password) {
        JSONResponse.badRequest(req, res, 'password cannot be updated')
        return
      }

      const update = await this.usersService.updateProfile(id, body)

      JSONResponse.success(req, res, 'success', update)
    } catch (e) {
      JSONResponse.serverError(req, res)
    }
  }
}

export default UsersController
