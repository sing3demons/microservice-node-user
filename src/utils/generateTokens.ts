import jwt from 'jsonwebtoken'
export default class JsonWebToken {
  private readonly privateKey: string
  private readonly publicKey: string

  constructor(privateKey: string, publicKey: string) {
    this.privateKey = privateKey
    this.publicKey = publicKey
  }
  public signToken(payload: any, expire?: string): string {

    const token: string = jwt.sign(payload, this.privateKey as jwt.Secret, {
      algorithm: 'RS256',
      expiresIn: expire ? expire : '1h'
    } as jwt.SignOptions)
    return token
  }

  public verifyToken(token: string): string | jwt.JwtPayload {
    const decoded = jwt.verify(token, this.publicKey, {
      algorithms: ['RS256']
    })
    return decoded
  }
}
