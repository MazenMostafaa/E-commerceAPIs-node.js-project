// import { cartModel } from '../../../DB/Models/cart.model.js'
import { couponModel } from '../../../DB/Models/coupon.model.js'
import { orderModel } from '../../../DB/Models/order.model.js'
import { productModel } from '../../../DB/Models/product.model.js'
import { isCouponValid } from '../../Utils/couponValidation.js'
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('123456_=!ascbhdtel', 5)

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
    } else if (req.coupon?.isFixedAmount) {
        paidAmount = subTotal - req.coupon.couponAmount
    } else {
        paidAmount = subTotal
    }

    //======================= paymentMethod  + orderStatus ==================
    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

    const customId = nanoid()
    const orderObject = {
        userId,
        products,
        address,
        phoneNumbers,
        orderStatus,
        paymentMethod,
        subTotal,
        paidAmount,
        couponId: req.coupon?._id,
        customId
    }
    req.failedDocument = {
        model: 'orderModel',
        id: `${customId}, ${userId}`
    }

    const orderDB = await orderModel.create(orderObject)

    if (orderDB) {
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

        //TODO: remove product from userCart if exist

        return res.status(201).json({ message: 'Order is created Done', orderDB })
    }
    return next(new Error('fail to create your order', { cause: 400 }))
}