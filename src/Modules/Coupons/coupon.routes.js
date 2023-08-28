import { Router } from 'express'
const router = Router()
import * as cc from './coupons.controller.js'
import { asyncHandler } from '../../Utils/asyncHandler.js'
import { validationCoreFunction } from '../../Middlewares/validation.js'
import { addCouponSchema } from './coupon.validationSchemas.js'
import { isAuth } from '../../Middlewares/auth.js'


router.post(
    '/create',
    isAuth,
    validationCoreFunction(addCouponSchema),
    asyncHandler(cc.addCoupon),
)
export default router