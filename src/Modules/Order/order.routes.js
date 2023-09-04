import { Router } from 'express'
const router = Router()
import * as oc from './order.controller.js'
import { asyncHandler } from '../../Utils/asyncHandler.js'
import { isAuth } from '../../Middlewares/auth.js'
import { validationCoreFunction } from '../../Middlewares/validation.js'
import * as validator from './order.validationSchemas.js'
import { orderApisRoles } from './order.endPoints.js'

router.use(isAuth(orderApisRoles.GENERATE_ORDER))

router.post('/', validationCoreFunction(validator.CreateOrderSchema), asyncHandler(oc.createOrder))

router.post('/fromCartToOrder', validationCoreFunction(validator.FromCartToOrderSchema), asyncHandler(oc.fromCartoOrder))

export default router