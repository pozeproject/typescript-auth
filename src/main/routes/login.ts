import { Router } from 'express'
import { makeFacebookLoginController } from '@/main/factories/controllers'
import { adaptExpressRoute } from '@/main/adapaters'

export default (router: Router): void => {
  const controller = makeFacebookLoginController()
  const adapter = adaptExpressRoute(controller)
  router.post('/login/facebook', adapter)
}
