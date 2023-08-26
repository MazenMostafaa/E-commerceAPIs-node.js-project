import { Router } from 'express'
import { multerCloudFunction } from '../../Services/multerCloud.js'
import { allowedExtensions } from '../../Utils/allowedExtensions.js'
import { asyncHandler } from '../../Utils/asyncHandler.js'
import * as cc from './categories.controller.js'
import { validationCoreFunction } from '../../Middlewares/validation.js'
import * as validators from './category.validationSchemas.js'
import subCategoryRouter from '../subCategories/subCategories.routes.js'

const router = Router()


router.use('/:categoryId', subCategoryRouter)

router.get('/', asyncHandler(cc.getAllCategories))

router.post(
    '/create',
    multerCloudFunction(allowedExtensions.Image).single('categoryImage'),
    validationCoreFunction(validators.createCategorySchema),
    asyncHandler(cc.createCategory),
)

router.put(
    '/update',
    multerCloudFunction(allowedExtensions.Image).single('categoryImage'),
    validationCoreFunction(validators.updateCategorySchema),
    asyncHandler(cc.updateCategory),
)

router.delete('/delete',
    validationCoreFunction(validators.deleteCategorySchema)
    , asyncHandler(cc.deleteCategory))


export default router