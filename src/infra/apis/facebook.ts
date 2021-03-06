import { LoadFacebookUserApi } from '@/domain/contracts/apis'
import { HttpGetClient } from '@/infra/http/client'

type AppToken = {
  access_token: string
}

type DebugToken = {
  data: {
    user_id: string
  }
}

type FacebookUserInfo = {
  id: string
  name: string
  email: string
}

type Params = LoadFacebookUserApi.Params
type Result = LoadFacebookUserApi.Result

export class FacebookApi implements LoadFacebookUserApi {
  private readonly baseUrl: string = 'https://graph.facebook.com'
  constructor (
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly httpClient: HttpGetClient
  ) {}

  async loadUser ({ token }: Params): Promise<Result> {
    return this.getUserInfo(token)
      .then(({ name, email, id }) => ({ name, email, facebookId: id }))
      .catch(() => undefined)
  }

  private async getAppToken (): Promise<AppToken> {
    const appToken = await this.httpClient.get({
      url: `${this.baseUrl}/oauth/access_token`,
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      }
    })
    return appToken
  }

  private async getDebugToken (clientToken: string): Promise<DebugToken> {
    const appToken = await this.getAppToken()
    return this.httpClient.get({
      url: `${this.baseUrl}/debug_token/`,
      params: {
        access_token: appToken.access_token,
        input_token: clientToken
      }
    })
  }

  private async getUserInfo (clientToken: string): Promise<FacebookUserInfo> {
    const debugToken = await this.getDebugToken(clientToken)
    return this.httpClient.get({
      url: `${this.baseUrl}/${debugToken.data.user_id}/`,
      params: {
        fields: ['id', 'name', 'email'].join(','),
        access_token: clientToken
      }
    })
  }
}
