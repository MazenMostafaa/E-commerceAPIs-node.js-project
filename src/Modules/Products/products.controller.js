import slugify from 'slugify'
import { brandModel } from '../../../DB/Models/brand.model.js'
import { categoryModel } from '../../../DB/Models/category.model.js'
import { subCategoryModel } from '../../../DB/Models/subCategory.model.js'
import cloudinary from '../../Utils/cloudinaryConfig.js'
import { paginationFunction } from '../../Utils/pagination.js'
import { customAlphabet } from 'nanoid'
import { productModel } from '../../../DB/Models/product.model.js'
import { ApiFeatures } from '../../Utils/apiFeatures.js'
const nanoid = customAlphabet('123456_=!ascbhdtel', 5)


//=============================Add a product===================
export const addProduct = async (req, res, next) => {

    const { title, desc, price, appliedDiscount, colors, sizes, stock } = req.body

    const { categoryId, subCategoryId, brandId } = req.query
    // check Ids
    const subCategoryExists = await subCategoryModel.findById(subCategoryId)
    if (!subCategoryExists) {
        return next(new Error('invalid subCategory', { cause: 400 }))
    }

    const categoryExists = await categoryModel.findById(categoryId)
    if (!categoryExists) {
        return next(new Error('invalid category', { cause: 400 }))
    }

    const brandExists = await brandModel.findById(brandId)

    if (!brandExists) {
        return next(new Error('invalid brand', { cause: 400 }))
    }

    if (brandExists.categoryId.toString() !== categoryId.toString() ||
        brandExists.subCategoryId.toString() !== subCategoryId.toString()) {
        return next(new Error('category or subcategory does not related to This brand', { cause: 400 }))
    }

    const slug = slugify(title, {
        replacement: '_',
    })
    //   if (appliedDiscount) {
    //   const priceAfterDiscount = price - price * ((appliedDiscount || 0) / 100)
    const priceAfterDiscount = price * (1 - (appliedDiscount || 0) / 100)
    //   }

    if (!req.files.length) {
        return next(new Error('please upload pictures', { cause: 400 }))
    }
    const customId = nanoid()
    const Images = []
    const publicIds = []
    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            file.path,
            {
                folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExists.customId}/subCategories/${subCategoryExists.customId}/Brands/${brandExists.customId}/Products/${customId}`,
            },
        )
        Images.push({ secure_url, public_id })
        publicIds.push(public_id)
    }
    req.imagePath = `${process.env.PROJECT_FOLDER}/Categories/${categoryExists.customId}/subCategories/${subCategoryExists.customId}/Brands/${brandExists.customId}/Products/${customId}`

    const productObject = {
        title,
        slug,
        desc,
        price,
        appliedDiscount,
        priceAfterDiscount,
        colors,
        sizes,
        stock,
        categoryId,
        subCategoryId,
        brandId,
        Images,
        customId,
    }

    req.failedDocument = {
        model: 'productModel',
        id: `${customId}`
    }
    const product = await productModel.create(productObject)
    // productObject = 5
    // TODO: delete the uploaded pirctures if the function fail in catch scope
    if (!product) {
        await cloudinary.api.delete_resources(publicIds)
        return next(new Error('trye again later', { cause: 400 }))
    }
    res.status(200).json({ message: 'Done', product })
}

//=================================update a product===========================
export const updateProduct = async (req, res, next) => {
    const { title, desc, price, appliedDiscount, colors, sizes, stock } = req.body

    const { productId, categoryId, subCategoryId, brandId } = req.query

    // check productId
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error('invalid product id', { cause: 400 }))
    }

    // ====================================Check Category Id=============================================
    let CategOldCustomID
    let categoryExists = await categoryModel.findById(categoryId)

    if (categoryExists) {
        if (product.categoryId.toString() !== categoryExists._id.toString()) {

            return next(new Error('invalid Category id', { cause: 400 }))
        }
        CategOldCustomID = categoryExists.customId

    }
    else {
        categoryExists = await categoryModel.findById(product.categoryId)
        CategOldCustomID = categoryExists.customId
    }

    // ================================Check subCategory Id=================================================
    let SubCategOldCustomID
    let subCategoryExists = await subCategoryModel.findById(subCategoryId)

    if (subCategoryExists) {
        if (product.subCategoryId.toString() !== subCategoryExists._id.toString()) {
            return next(new Error('invalid subCategory id', { cause: 400 }))
        }
        if (subCategoryExists.categoryId.toString() !== categoryId ? categoryId : 1 .toString()) {

            return next(new Error('invalid Category id Related to this subCategory', { cause: 400 }))
        }
        SubCategOldCustomID = subCategoryExists.customId

    }
    else {
        subCategoryExists = await subCategoryModel.findById(product.subCategoryId)
        SubCategOldCustomID = subCategoryExists.customId
    }

    // ===================================Check Brand Id (OR) Change Path Of Brand==============================================
    let flag = false
    let BrandOldCustomID

    let categIsValid
    let subCategIsValid

    let brandExists = await brandModel.findById(brandId)
    if (brandExists) {

        if (product.brandId.toString() !== brandExists._id.toString()) {


            if (brandExists.categoryId.toString() !== categoryId || 1 .toString()) {
                categIsValid = await categoryModel.findById(brandExists.categoryId)

                if (!categIsValid) {
                    return next(new Error('invalid Category id Related to this Brand', { cause: 400 }))
                }
            }


            if (brandExists.subCategoryId.toString() !== subCategoryId || 1 .toString()) {
                subCategIsValid = await subCategoryModel.findById(brandExists.subCategoryId)

                if (!subCategIsValid) {
                    return next(new Error('invalid SubCategory id', { cause: 400 }))
                }
            }

            if (subCategIsValid.categoryId.toString() !== categIsValid._id.toString()) {
                return next(new Error('There is something went wrong category does not compatible with subCategory', { cause: 400 }))
            }

            product.categoryId = categIsValid._id
            product.subCategoryId = subCategIsValid._id;

            const OldBrand = await brandModel.findById(product.brandId)

            BrandOldCustomID = OldBrand.customId
            product.customId
            flag = true
        }
        product.brandId = brandId
        product.categoryId = brandExists.categoryId
        product.subCategoryId = brandExists.subCategoryId
    } else {
        brandExists = await brandModel.findById(product.brandId)
        BrandOldCustomID = brandExists.customId
    }

    // ============In case getting Price and Discount amount==============
    if (appliedDiscount && price) {
        const priceAfterDiscount = price * (1 - (appliedDiscount) / 100)
        product.priceAfterDiscount = priceAfterDiscount
        product.price = price
        product.appliedDiscount = appliedDiscount
    }
    // ============In case getting Price amount==============
    else if (price) {
        const priceAfterDiscount =
            price * (1 - (product.appliedDiscount || 0) / 100)
        product.priceAfterDiscount = priceAfterDiscount
        product.price = price
    }
    // ============In case getting Discount amount==============
    else if (appliedDiscount) {
        const priceAfterDiscount =
            product.price * (1 - (appliedDiscount) / 100)
        product.priceAfterDiscount = priceAfterDiscount
        product.appliedDiscount = appliedDiscount
    }

    // ===============Delete our old Path of Brand in cloudinary================
    if (flag) {

        await cloudinary.api.delete_resources_by_prefix(
            `${process.env.PROJECT_FOLDER}/Categories/${categIsValid.customId}/subCategories/${SubCategOldCustomID}/Brands/${BrandOldCustomID}/Products/${product.customId}`)

        await cloudinary.api.delete_folder(
            `${process.env.PROJECT_FOLDER}/Categories/${CategOldCustomID}/subCategories/${SubCategOldCustomID}/Brands/${BrandOldCustomID}/Products/${product.customId}`)
    }
    // =================Handle Media of product in the DB and the cloudinary==========
    if (req.files.length) {
        let ImageArr = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(
                file.path,
                {
                    folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExists.customId}/subCategories/${subCategoryExists.customId}/Brands/${brandExists.customId}/Products/${product.customId}`,
                },
            )
            ImageArr.push({ secure_url, public_id })
        }
        let public_ids = []
        for (const image of product.Images) {
            public_ids.push(image.public_id)
        }
        await cloudinary.api.delete_resources(public_ids)
        product.Images = ImageArr
    }

    if (title) {
        product.title = title
        product.slug = slugify(title, '_')
    }
    if (desc) product.desc = desc
    if (colors) product.colors = colors
    if (sizes) product.sizes = sizes
    if (stock) product.stock = stock

    await product.save()
    res.status(200).json({ message: 'product has been Updated successfully', product })
}

//=================================delete a product===========================
export const deleteProduct = async (req, res, next) => {
    const { productId } = req.query
    // check productId =========Delete DB=============
    const product = await productModel.findByIdAndDelete(productId)
    if (!product) {
        return next(new Error('invalid product id', { cause: 400 }))
    }

    // =================Delete Cloudinary==============
    const category = await categoryModel.findById(product.categoryId)
    if (!category) {
        return next(new Error('invalid category ID', { cause: 400 }))
    }

    const subCateg = await subCategoryModel.findById(product.subCategoryId)
    if (!subCateg) {
        return next(new Error('invalid subCategory ID', { cause: 400 }))
    }

    const brand = await brandModel.findById(product.brandId)
    if (!brand) {
        return next(new Error('invalid brand ID', { cause: 400 }))
    }

    await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Categories/${category.customId}/subCategories/${subCateg.customId}/Brands/${brand.customId}/Products/${product.customId}`)

    await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Categories/${category.customId}/subCategories/${subCateg.customId}/Brands/${brand.customId}/Products/${product.customId}`)


    res.status(200).json({ message: 'Deleted Done', product })
}

//=================================get all products paginated===========================
export const getAllProd = async (req, res, next) => {
    const { page, size } = req.query
    const { limit, skip } = paginationFunction({ page, size })
    const products = await productModel.find().limit(limit).skip(skip)
    res.status(200).json({ message: 'Done', products })
}

//=================================get specific products paginated===========================
export const getProductsByTitle = async (req, res, next) => {
    const { searchKey, page, size } = req.query

    const { limit, skip } = paginationFunction({ page, size })

    const productsc = await productModel
        .find({
            $or: [
                { title: { $regex: searchKey, $options: 'i' } },
                { desc: { $regex: searchKey, $options: 'i' } },
            ],
        })
        .limit(limit)
        .skip(skip)
    res.status(200).json({ message: 'Done', productsc })
}

// ========================== apply some features in api =====================
export const listProducts = async (req, res, next) => {

    const ApiFeaturesInstance = new ApiFeatures(productModel.find({}), req.query)
        .pagination()
        .filters()
        .sort()
    const products = await ApiFeaturesInstance.mongooseQuery
    res.status(200).json({ message: 'Done', products })
}

  // gt, lt, gte , lte , in , nin, eq ,neq , regex