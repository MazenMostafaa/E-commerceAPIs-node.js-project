import joi from 'joi'
import { generalFields } from '../../Middlewares/validation.js'

export const addCouponSchema = {
    body: joi.object({
        couponCode: joi.string().min(3).max(55).required(),
        couponAmount: joi.number().positive().min(1).max(100).when('isFixedAmount', {
            is: true,
            then: joi.number().min(1)
        }).required(),
        fromDate: joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)).required(),
        toDate: joi.date().greater(joi.ref('fromDate')).required(),
        isPercentage: joi.boolean().optional(),
        isFixedAmount: joi.boolean().optional(),
        couponAssginedToUsers: joi.array().items().min(1).unique().required()
    }).required()
}
