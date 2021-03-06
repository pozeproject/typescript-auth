import { TokenValidator } from '@/domain/contracts/crypto'
import { MockProxy, mock } from 'jest-mock-extended'
import { Authorize, setupAuthorize } from '@/domain/use-cases'

describe('Authorize', () => {
  let crypto: MockProxy<TokenValidator>
  let sut: Authorize
  let token: string

  beforeAll(() => {
    token = 'any_token'
    crypto = mock()
    crypto.validateToken.mockResolvedValue('valid_id')
  })

  beforeEach(() => {
    sut = setupAuthorize(crypto)
  })
  it('should call TokenValidator with correct params', async () => {
    await sut({ token })

    expect(crypto.validateToken).toHaveBeenCalledWith({ token })
    expect(crypto.validateToken).toHaveBeenCalledTimes(1)
  })

  it('should return the correct accessToken', async () => {
    const userId = await sut({ token })

    expect(userId).toBe('valid_id')
  })
})
