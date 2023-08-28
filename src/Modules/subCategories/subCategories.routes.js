
import { Router } from 'express'
import * as sc from './subCategories.controller.js'
import { multerCloudFunction } from '../../Services/multerCloud.js'
import { allowedExtensions } from '../../Utils/allowedExtensions.js'
import { asyncHandler } from '../../Utils/asyncHandler.js'
import * as validators from './subCategory.validationSchemas.js'
import { validationCoreFunction } from '../../Middlewares/validation.js'
import { isAuth } from '../../Middlewares/auth.js'

const router = Router({ mergeParams: true })


router.get('/', asyncHandler(sc.getAllSubCategories))

router.post(
    '/create',
    isAuth,
    multerCloudFunction(allowedExtensions.Image).single('subCategoryImage'),
    validationCoreFunction(validators.createSubCategorySchema),
    asyncHandler(sc.createSubCategory),
)

router.put(
    '/update',
    isAuth,
    multerCloudFunction(allowedExtensions.Image).single('subCategoryImage'),
    validationCoreFunction(validators.updateSubCategorySchema),
    asyncHandler(sc.updateSubCategory),
)

router.delete('/delete',
    isAuth,
    validationCoreFunction(validators.deleteCategorySchema)
    , asyncHandler(sc.deleteSubCategory))




export default router

//  /category/:categoryId  => subCategoryRouter







