import { couponModel } from '../../../DB/Models/coupon.model.js'
import { userModel } from '../../../DB/Models/user.model.js'

export const addCoupon = async (req, res, next) => {
    const { _id } = req.authUser
    const {
        couponCode,
        couponAmount,
        fromDate,
        toDate,
        isPercentage,
        isFixedAmount,
        couponAssginedToUsers
    } = req.body

    // check coupon code if it's duplicate
    const isCouponCodeDuplicate = await couponModel.findOne({ couponCode })
    if (isCouponCodeDuplicate) {
        return next(new Error('duplicate couponCode', { cause: 400 }))
    }

    // check the choice between fixed or percentage amount 
    if ((isFixedAmount === isPercentage)) {
        return next(
            new Error('select if the coupon is percentage or fixedAmount', {
                cause: 400,
            }),
        )
    }

    //======================== assgin to users ==================
    let usersIds = []
    for (const user of couponAssginedToUsers) {
        usersIds.push(user.userId)
    }

    const usersCheck = await userModel.find({
        _id: {
            $in: usersIds,
        },
    })

    if (usersIds.length !== usersCheck.length) {
        return next(new Error('invalid userIds', { cause: 400 }))
    }

    const couponObject = {
        couponCode,
        couponAmount,
        fromDate,
        toDate,
        isPercentage,
        isFixedAmount,
        couponAssginedToUsers,
        // couponAssginedToProduct,
        createdBy: _id,
    }
    req.failedDocument = {
        model: 'couponModel',
        id: `${couponCode}`
    }

    const couponDb = await couponModel.create(couponObject)
    if (!couponDb) {
        return next(new Error('fail to add coupon', { cause: 400 }))
    }
    res.status(201).json({ message: 'Done', couponDb })
}


// ================================== delete coupon ==========================
export const deleteCoupon = async (req, res, next) => {
    const { couponId } = req.query
    const { _id } = req.authUser

    const isCouponCodeDuplicated = await couponModel.findOneAndDelete({
        _id: couponId,
        createdBy: _id,
    })
    if (!isCouponCodeDuplicated) {
        return next(new Error('invalid couponId', { cause: 400 }))
    }
    res.status(201).json({ message: 'Deleted done' })
}