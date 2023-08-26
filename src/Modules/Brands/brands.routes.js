import { Router } from 'express'
import * as bc from './brands.controller.js'
import { asyncHandler } from '../../Utils/asyncHandler.js'
import { multerCloudFunction } from '../../Services/multerCloud.js'
import { allowedExtensions } from '../../Utils/allowedExtensions.js'
import { validationCoreFunction } from '../../Middlewares/validation.js'
import * as validators from './brand.validationSchemas.js'
const router = Router()




router.get('/', asyncHandler(bc.getAllBrands))

router.post(
    '/create',
    multerCloudFunction(allowedExtensions.Image).single('logoImage'),
    validationCoreFunction(validators.createBrandSchema),
    asyncHandler(bc.addBrand),
)

router.put(
    '/update',
    multerCloudFunction(allowedExtensions.Image).single('logoImage'),
    validationCoreFunction(validators.updateBrandSchema),
    asyncHandler(bc.updateBrand),
)
router.delete('/delete',
    validationCoreFunction(validators.deleteBrandSchema)
    , asyncHandler(bc.deleteBrand))





export default router