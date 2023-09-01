import cloudinary from './cloudinaryConfig.js'
import * as allModels from '../../DB/Models/models.js'

export const asyncHandler = (API) => {
    return (req, res, next) => {
        API(req, res, next)
            .catch(async (error) => {
                console.log(error);

                console.log(req.imagePath)
                if (req.imagePath) {
                    //=========== Delete from cloudinary ==============
                    await cloudinary.api.delete_resources_by_prefix(req.imagePath)

                    await cloudinary.api.delete_folder(req.imagePath)
                }
                console.log(req.failedDocument);
                // =========== Delete from DB ==============
                if (req.failedDocument) {
                    const { model, id } = req.failedDocument
                    if (model === 'productModel') await allModels.productModel.findOneAndDelete(id)
                    if (model === 'categoryModel') await allModels.categoryModel.findOneAndDelete(id)
                    if (model === 'subCategoryModel') await allModels.subCategoryModel.findOneAndDelete(id)
                    if (model === 'couponModel') await allModels.couponModel.findOneAndDelete(id)
                    if (model === 'brandModel') await allModels.brandModel.findOneAndDelete(id)
                    if (model === 'userModel') await allModels.userModel.findOneAndDelete(id)
                    if (model === 'cartModel') await allModels.cartModel.findOneAndDelete(id)
                    if (model === 'orderModel') await allModels.orderModel.findOneAndDelete(id)
                    // await allModels.model.findOneAndDelete(id)
                }
                res.status(500).json({ Message: "Falied" })
            })
    }
}

export const globalResponse = (err, req, res, next) => {
    if (err) {
        if (req.validationErrorArr) {
            return res
                .status(err['cause'] || 400)
                .json({ message: req.validationErrorArr })
        }

        return res.status(err['cause'] || 500).json({ message: err.message })
    }
}