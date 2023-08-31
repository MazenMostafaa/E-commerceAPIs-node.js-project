import { Router } from 'express'
const router = Router()
import * as cartC from './cart.controller.js'
import { asyncHandler } from '../../Utils/asyncHandler.js'
import { isAuth } from '../../Middlewares/auth.js'
import { validationCoreFunction } from '../../Middlewares/validation.js'
import * as validator from '../Cart/cart.validationSchemas.js'

router.post('/', isAuth, validationCoreFunction(validator.AddToCartSchema), asyncHandler(cartC.addToCart))

router.delete('/deleteFromCart', isAuth, validationCoreFunction(validator.DeleteFromCartSchema), asyncHandler(cartC.deleteFromCart))


export default router