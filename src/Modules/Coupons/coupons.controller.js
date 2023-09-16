import { couponModel } from '../../../DB/Models/coupon.model.js'
import { userModel } from '../../../DB/Models/user.model.js'
import moment from 'moment'

// ===========================Add Coupon ========================
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


    const couponDb = await couponModel.create(couponObject)
    req.failedDocument = {
        model: couponModel,
        _id: couponDb._id
    }
    if (!couponDb) {
        return next(new Error('fail to add coupon', { cause: 400 }))
    }
    res.status(201).json({ message: 'Done', couponDb })
}

// ===========================Update Coupon ========================
export const UpdateCoupon = async (req, res, next) => {
    const { _id } = req.authUser
    const { couponId } = req.query
    const {
        couponCode,
        couponAmount,
        fromDate,
        toDate,
        isFixedAmount,
        couponAssginedToUsers
    } = req.body

    // check existing of coupon
    const isCouponExist = await couponModel.findOne({
        _id: couponId,
        createdBy: _id
    })
    if (!isCouponExist) {
        return next(new Error('Invalid Coupon Id', { cause: 400 }))
    }

    if (couponCode) {

        if (isCouponExist.couponCode == couponCode.toLowerCase()) {
            return next(new Error('please enter different name from the old coupon name', { cause: 400 }))
        }
        // check coupon code if it's duplicate
        if (await couponModel.findOne({ couponCode })) {
            return next(new Error('duplicate couponCode', { cause: 400 }))
        }

        isCouponExist.couponCode = couponCode
    }

    if (couponAmount) isCouponExist.couponAmount = couponAmount


    if (fromDate && toDate) {

        if (moment(new Date(fromDate)).isBefore(moment(new Date(isCouponExist.fromDate)))) {
            return next(new Error('can not update (from date) before the day of (from date) has already exsit', { cause: 400 }))
        }
        if (moment(new Date(fromDate)).isAfter(moment(new Date()))) {
            isCouponExist.couponStatus = 'Expired'
        } else { isCouponExist.couponStatus = 'Valid' }
    }

    if (isFixedAmount === true) {
        isCouponExist.isFixedAmount = true
        isCouponExist.isPercentage = false
    } else {
        isCouponExist.isFixedAmount = false
        isCouponExist.isPercentage = true
    }

    //======================== assgin to users ==================
    if (couponAssginedToUsers) {
        let usersIds = []
        let newUsers = []
        let updateMaxUsage = []

        for (const user of couponAssginedToUsers) {

            //=============== Add new Assigned user ===================

            if (isCouponExist.couponAssginedToUsers.find((obj) => {
                user.userId === obj.userId
            })) {
                updateMaxUsage.push(user)
                console.log({ "update User": updateMaxUsage });
                // continue
            } else {
                usersIds.push(user.userId)
                newUsers.push(user)
                console.log(
                    { "Add user": newUsers }
                );
            }
            // =============== Push to updateMaxUsage ===============

        }

        // =========== Check Id have been entered ================
        const usersCheck = await userModel.find({
            _id: {
                $in: usersIds,
            },
        })

        if (usersIds.length !== usersCheck.length) {
            return next(new Error('invalid userIds', { cause: 400 }))
        }

        if (newUsers.length) {
            isCouponExist.couponAssginedToUsers = isCouponExist.couponAssginedToUsers.concat(newUsers)
        }

        if (updateMaxUsage.length) {
            for (let obj = 0; obj < updateMaxUsage.length; obj++) {
                const { userId, maxUsage } = updateMaxUsage[obj]
                isCouponExist.couponAssginedToUsers = isCouponExist.couponAssginedToUsers.map((item) => {
                    if (item.userId === userId) {
                        item.maxUsage = maxUsage ? item.usageCount <= maxUsage : item.maxUsage;
                    }
                })

            }
        }
    }



    isCouponExist.updatedBy = _id


    await isCouponExist.save()
    res.status(200).json({ message: 'Updated Done', isCouponExist })

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