import { Router } from 'express'
const router = Router()
import * as oc from './order.controller.js'
import { asyncHandler } from '../../Utils/asyncHandler.js'
import { isAuth } from '../../Middlewares/auth.js'
import { validationCoreFunction } from '../../Middlewares/validation.js'
import * as validator from './order.validationSchemas.js'



router.post('/', isAuth, validationCoreFunction(validator.CreateOrderSchema), asyncHandler(oc.createOrder))

// router.post('/orderCart', isAuth(), asyncHandler(oc.fromCartoOrder))

export default router