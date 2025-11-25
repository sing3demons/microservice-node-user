import { RequestQuery, User, UsersResponse } from '../dto/users'
import UsersRepository, { IUsersRepository } from '../repositories/users.repository'
import { compare, genSalt, hash } from 'bcrypt'
import fs from 'fs'
import { join } from 'path'
import JWTTokens from '../utils/jwt'

export interface IUsersService {
  getUsers: (query: RequestQuery) => Promise<UsersResponse>
  getUserById: (id: string) => Promise<User | null>
  createUser: (data: User) => Promise<User | undefined>
  updateUser: (id: string, data: User) => Promise<User>
  deleteUser: (id: string) => Promise<User>
  register: (u: User) => Promise<User>
  login: (email: string, password: string) => Promise<any>
  updateProfile: (id: string, data: User) => Promise<User>
}
class UsersService implements IUsersService {
  constructor(private readonly usersRepository: IUsersRepository) {}

  public getUsers = async (query: RequestQuery): Promise<UsersResponse> => {
    try {
      const { size, skip } = query

      const data = await this.usersRepository.findAll({
        skip: Number(skip) | 0,
        size: Number(size) | 10
      })

      if (!data) {
        throw new Error('Error retrieving users')
      }

      return data
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  }

  public getUserById = async (id: string): Promise<User | null> => {
    try {
      const user = await this.usersRepository.findById(id)
      if (!user) {
        return null
      }
      return user as User
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  }

  public createUser = async (data: User): Promise<User | undefined> => {
    try {
      const user = await this.usersRepository.createUser(data)
      return user
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
    }
  }

  public updateUser = async (id: string, data: User): Promise<User> => {
    try {
      const u = await this.usersRepository.updateUser(id, data)
      if (!u) {
        throw new Error('Error updating user')
      }
      return u
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  }

  public deleteUser = async (id: string): Promise<User> => {
    try {
      const user = await this.usersRepository.deleteUser(id)
      if (!user) {
        throw new Error('Error deleting user')
      }
      return user
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  }

  private hashPassword = async (password: string): Promise<string> => {
    const salt = await genSalt(10)
    return await hash(password, salt)
  }

  private comparePassword = async (
    password: string,
    hashPassword: string
  ): Promise<boolean> => {
    const match = await compare(password, hashPassword)
    if (!match) {
      throw new Error('Invalid password')
    }
    return match
  }

  public register = async (u: User): Promise<User> => {
    try {
      const user = await this.usersRepository.findUserByEmail(u.email)
      if (user) {
        throw new Error('User already exists')
      }

      u.password = await this.hashPassword(u.password)
      const newUser = await this.usersRepository.createUser(u)
      if (!newUser) {
        throw new Error('Error creating user')
      }

      return newUser
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  }

  public login = async (email: string, password: string) => {
    try {
      const user = await this.usersRepository.findUserByEmail(email)
      if (!user) {
        throw new Error('not found')
      }

      await this.comparePassword(password, user.password)
      const token = await JWTTokens.generateToken(user)
      if (!token) {
        throw new Error('Error generating token')
      }

      return token
    } catch (e) {
      if (e instanceof Error) {
        throw e
      }
      throw e
    }
  }

  public updateProfile = async (id: string, data: User) => {
    try {
      const user = await this.usersRepository.findById(id)
      if (!user) {
        throw new Error('User not found')
      }

      if (data.profile && user.profile) {
        await this.deleteProfile(user.profile)
      }

      const u = await this.usersRepository.updateUser(id, data)

      if (!u) {
        throw new Error('Error updating user')
      }
      return u
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  }

  private deleteProfile = async (profile: string) => {
    try {
      console.log('===============>', process.cwd(), '<====================')
      const dir = join(__dirname, '../../public', profile)
      if (fs.existsSync(dir)) {
        fs.unlinkSync(dir)
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw error
    }
  }
}

export default UsersService
