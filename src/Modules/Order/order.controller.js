import { cartModel } from '../../../DB/Models/cart.model.js'
import { couponModel } from '../../../DB/Models/coupon.model.js'
import { orderModel } from '../../../DB/Models/order.model.js'
import { productModel } from '../../../DB/Models/product.model.js'
import { isCouponValid } from '../../Utils/couponValidation.js'
import { customAlphabet } from 'nanoid'
import createInvoice from '../../Utils/pdfkit.js'
import { sendEmailService } from '../../Services/sendEmailService.js'
import { qrCodeFunction } from '../../Utils/qrCodeFunction.js'
const nanoid = customAlphabet('123456_=!ascbhdtel', 5)
import { encryptionFun, decryptionFun } from '../../Utils/encryptionFunction.js'

// ========================== create order =================
export const createOrder = async (req, res, next) => {
    const userId = req.authUser._id
    const {
        productId,
        quantity,
        address,
        phoneNumbers,
        paymentMethod,
        couponCode,
    } = req.body

    // ======================== coupon check ================
    if (couponCode) {
        const coupon = await couponModel
            .findOne({ couponCode })
            .select('isPercentage isFixedAmount couponAmount couponAssginedToUsers')

        const isCouponValidResult = await isCouponValid({
            couponCode,
            userId,
            next,
        })
        if (isCouponValidResult !== true) {
            return isCouponValidResult
        }
        req.coupon = coupon
    }

    // ====================== products check ================
    const products = []
    const isProductValid = await productModel.findOne({
        _id: productId,
        stock: { $gte: quantity },
    })
    if (!isProductValid) {
        return next(
            new Error('invalid product please check your quantity or Id', { cause: 400 }),
        )
    }
    const productObject = {
        productId,
        quantity,
        title: isProductValid.title,
        price: isProductValid.priceAfterDiscount,
        finalPrice: isProductValid.priceAfterDiscount * quantity,
    }
    products.push(productObject)

    //===================== subTotal ======================
    const subTotal = productObject.finalPrice
    //====================== paid Amount =================
    let paidAmount = 0
    if (req.coupon?.isPercentage) {
        paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
    } else if (req.coupon?.isFixedAmount && req.coupon?.couponAmount <= subTotal) {
        paidAmount = subTotal - req.coupon.couponAmount
    } else {
        paidAmount = subTotal
    }

    //======================= paymentMethod  + orderStatus ==================
    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

    const encryptedPhoneNumbers = encryptionFun({ phoneNumber: phoneNumbers })
    console.log(encryptedPhoneNumbers)
    // console.log(decryptionFun({ encryptedPhoneNumber: encryptedPhoneNumbers }));

    const customId = nanoid()
    const orderObject = {
        userId,
        products,
        address,
        phoneNumbers: encryptedPhoneNumbers,
        orderStatus,
        paymentMethod,
        subTotal,
        paidAmount,
        couponId: req.coupon?._id,
        customId
    }
    req.failedDocument = {
        model: orderModel,
        id: `${customId}, ${userId}`
    }

    const orderDB = await orderModel.create(orderObject)

    if (!orderDB) {
        return next(new Error('fail to create your order', { cause: 400 }))
    }
    // increase usageCount for coupon usage
    if (req.coupon) {
        for (const user of req.coupon.couponAssginedToUsers) {
            if (user.userId.toString() == userId.toString()) {
                user.usageCount += 1
            }
        }
        await req.coupon.save()
    }

    // decrease product's stock by order's product quantity
    await productModel.findOneAndUpdate(
        { _id: productId },
        {
            $inc: { stock: -parseInt(quantity) },
        },
    )

    //  remove product from userCart if exist
    const checkUserCart = await cartModel.findOne({
        userId,
        'products.productId': productId
    })
    if (checkUserCart) {

        checkUserCart.products.forEach(({ productId }) => {

            if (productId == req.body.productId) {

                checkUserCart.products.splice(checkUserCart.products.indexOf(productId), 1)
            }
        })

        const updateUserCart = await cartModel.findByIdAndUpdate(checkUserCart._id, { products: checkUserCart.products })
        if (!updateUserCart) { return next(new Error('fail to update User cart', { cause: 400 })) }
    }

    const orderQr = await qrCodeFunction({
        data: { orderId: orderDB._id, products: orderDB.products },
    })
    //============================== invoice =============================
    const orderCode = `${req.authUser.userName}_${nanoid(3)}`
    // generat invoice object
    const orderinvoice = {
        shipping: {
            name: req.authUser.userName,
            address: orderDB.address,
            city: 'Tanta',
            // state: '',
            country: 'Egypt',
        },
        orderCode,
        date: orderDB.createdAt,
        items: orderDB.products,
        subTotal: orderDB.subTotal,
        paidAmount: orderDB.paidAmount,
    }
    // fs.unlink()
    await createInvoice(orderinvoice, `${orderCode}.pdf`)
    await sendEmailService({
        to: req.authUser.email,
        subject: 'Order Confirmation',
        message: '<h1> please find your invoice pdf below</h1>',
        attachments: [
            {
                path: `./Files/${orderCode}.pdf`,
            },
        ],
    })
    return res.status(201).json({ message: 'Order is created Done', orderDB, orderQr })

}

// =========================== create order from cart products ====================
export const fromCartoOrder = async (req, res, next) => {
    const userId = req.authUser._id
    const { cartId } = req.query
    const { address, phoneNumbers, paymentMethod, couponCode } = req.body

    const cart = await cartModel.findById(cartId)
    if (!cart || !cart.products.length) {
        return next(new Error('please fill your cart first', { cause: 400 }))
    }

    // ======================== coupon check ================
    if (couponCode) {
        const coupon = await couponModel
            .findOne({ couponCode })
            .select('isPercentage isFixedAmount couponAmount couponAssginedToUsers')
        const isCouponValidResult = await isCouponValid({
            couponCode,
            userId,
            next,
        })
        if (isCouponValidResult !== true) {
            return isCouponValidResult
        }
        req.coupon = coupon
    }

    let subTotal = cart.subTotal
    //====================== paid Amount =================
    let paidAmount = 0
    if (req.coupon?.isPercentage) {
        paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
    } else if (req.coupon?.isFixedAmount && req.coupon?.couponAmount <= subTotal) {
        paidAmount = subTotal - req.coupon.couponAmount
    } else {
        paidAmount = subTotal
    }

    //======================= paymentMethod  + orderStatus ==================
    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')
    let orderProduct = []
    for (const product of cart.products) {
        const productExist = await productModel.findById(product.productId)
        orderProduct.push({
            productId: product.productId,
            quantity: product.quantity,
            title: productExist.title,
            price: productExist.priceAfterDiscount,
            finalPrice: productExist.priceAfterDiscount * product.quantity,
        })
    }
    const encryptedPhoneNumbers = encryptionFun({ phoneNumber: phoneNumbers })
    console.log(encryptedPhoneNumbers)

    const customId = nanoid()
    const orderObject = {
        userId,
        products: orderProduct,
        address,
        phoneNumbers: encryptedPhoneNumbers,
        orderStatus,
        paymentMethod,
        subTotal,
        paidAmount,
        couponId: req.coupon?._id,
        customId
    }



    const orderDB = await orderModel.create(orderObject)
    req.failedDocument = {
        model: orderModel,
        _id: orderDB._id
    }
    if (!orderDB) {
        return next(new Error('fail to create your order', { cause: 400 }))
    }

    // increase usageCount for coupon usage
    if (req.coupon) {
        for (const user of req.coupon.couponAssginedToUsers) {
            if (user.userId.toString() == userId.toString()) {
                user.usageCount += 1
            }
        }
        await req.coupon.save()
    }

    // decrease product's stock by order's product quantity
    for (const product of cart.products) {
        await productModel.findOneAndUpdate(
            { _id: product.productId },
            {
                $inc: { stock: -parseInt(product.quantity) },
            },
        )
    }

    cart.products = []
    await cart.save()

    const orderQr = await qrCodeFunction({
        data: { orderId: orderDB._id, products: orderDB.products },
    })
    //============================== invoice =============================
    const orderCode = `${req.authUser.userName}_${nanoid(3)}`
    // generat invoice object
    const orderinvoice = {
        shipping: {
            name: req.authUser.userName,
            address: orderDB.address,
            city: 'Tanta',
            // state: '',
            country: 'Egypt',
        },
        orderCode,
        date: orderDB.createdAt,
        items: orderDB.products,
        subTotal: orderDB.subTotal,
        paidAmount: orderDB.paidAmount,
    }
    // fs.unlink()
    await createInvoice(orderinvoice, `${orderCode}.pdf`)
    await sendEmailService({
        to: req.authUser.email,
        subject: 'Order Confirmation',
        message: '<h1> please find your invoice pdf below</h1>',
        attachments: [
            {
                path: `./Files/${orderCode}.pdf`,
            },
        ],
    })

    return res.status(201).json({ message: 'Done', orderDB, orderQr, cart })
}