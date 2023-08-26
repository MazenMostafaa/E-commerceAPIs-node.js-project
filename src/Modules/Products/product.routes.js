import { Router } from 'express'
const router = Router()
import * as pc from './products.controller.js'
import { asyncHandler } from '../../Utils/asyncHandler.js'
import { multerCloudFunction } from '../../Services/multerCloud.js'
import { allowedExtensions } from '../../Utils/allowedExtensions.js'
import { validationCoreFunction } from '../../Middlewares/validation.js'
import * as validators from './product.validationSchemas.js'


router.get('/', validationCoreFunction(validators.GetAllProductSchema), asyncHandler(pc.getAllProd))

router.get('/title', validationCoreFunction(validators.GetSpecificProductSchema), asyncHandler(pc.getProductsByTitle))

router.get('/listProducts', asyncHandler(pc.listProducts))

router.post(
    '/add',
    multerCloudFunction(allowedExtensions.Image).array('productImage', 3),
    validationCoreFunction(validators.AddProductSchema),
    asyncHandler(pc.addProduct),
)

router.put(
    '/update',
    multerCloudFunction(allowedExtensions.Image).array('productImage', 3),
    validationCoreFunction(validators.updateProductSchema),
    asyncHandler(pc.updateProduct),
)

router.delete('/delete', validationCoreFunction(validators.DeleteProductSchema), asyncHandler(pc.deleteProduct))
export default router