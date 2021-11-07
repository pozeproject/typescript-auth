import { LoadFacebookUserApi } from '@/data/contracts/apis'
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

export class FacebookApi implements LoadFacebookUserApi {
  private readonly baseUrl: string = 'https://graph.facebook.com'
  constructor (
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly httpClient: HttpGetClient
  ) {}

  async loadUser (params: LoadFacebookUserApi.Params): Promise<LoadFacebookUserApi.Result> {
    const facebookUserInfo = await this.getUserInfo(params.token)
    return {
      name: facebookUserInfo.name,
      email: facebookUserInfo.email,
      facebookId: facebookUserInfo.id
    }
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
