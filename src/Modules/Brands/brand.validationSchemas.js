import joi from 'joi'
import { generalFields } from '../../Middlewares/validation.js'



export const createBrandSchema = {
    body: joi
        .object({
            name: joi.string().min(4).max(25).lowercase(),
        })
        .required()
        .options({ presence: 'required' }),

    file: generalFields.file.required(),

    query: joi.object({
        categoryId: generalFields.userid,
        subCategoryId: generalFields.userid
    }).required()
        .options({ presence: 'required' })
}

export const updateBrandSchema = {
    body: joi
        .object({
            name: joi.string().min(4).max(25).optional(),
        })
        .required(),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required()
    }).messages({ "any.required": "file is required" }).optional(),
    query: joi.object({
        brandId: generalFields.userid
    }).required().options({ presence: 'required' })
}

export const deleteBrandSchema = {
    query: joi
        .object({
            brandId: generalFields.userid,
        })
        .required()
        .options({ presence: 'required' }),
}