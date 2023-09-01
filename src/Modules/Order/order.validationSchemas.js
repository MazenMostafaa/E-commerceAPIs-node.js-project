import joi from 'joi'
import { generalFields } from '../../Middlewares/validation.js'



export const CreateOrderSchema = {
    body: joi
        .object({
            productId: generalFields.userid,
            quantity: joi.number().positive().min(1),
            address: joi.string().min(3).max(50),
            phoneNumbers: joi.array().items(joi.string().regex(/^[0-9]{11}$/)).min(1).unique(),
            paymentMethod: joi.string().valid('cash', 'card'),
            couponCode: joi.string().min(3).max(55)
        })
        .required()
        .options({ presence: 'required' }),
}