import { Router } from 'express'
const router = Router()
import * as cc from './coupons.controller.js'
import { asyncHandler } from '../../Utils/asyncHandler.js'
import { validationCoreFunction } from '../../Middlewares/validation.js'
import * as validator from './coupon.validationSchemas.js'
import { isAuth } from '../../Middlewares/auth.js'


router.post(
    '/create',
    isAuth,
    validationCoreFunction(validator.addCouponSchema),
    asyncHandler(cc.addCoupon),
)

router.delete(
    '/delete',
    isAuth,
    validationCoreFunction(validator.deleteCouponSchem),
    asyncHandler(cc.deleteCoupon),
)

export default router