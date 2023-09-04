import { globalResponse } from './asyncHandler.js'
import { connectDB } from '../../DB/connection.js'
import * as allRouters from '../Modules/index.routers.js'
import { changeCouponStatusCron } from './cronJobs.js'
import { gracefulShutdown } from 'node-schedule'

export const initiateApp = (app, express) => {

    const port = process.env.PORT || 5000

    connectDB()
    app.use(express.json())
    app.get('/', (req, res) => res.send('Hello There in my E-commerce platform! '))

    app.use('/category', allRouters.categoryRouters)
    app.use('/subCategory', allRouters.subCategoryRouters)
    app.use('/brand', allRouters.brandRouters)
    app.use('/product', allRouters.productRouters)
    app.use('/coupon', allRouters.couponRouter)
    app.use('/auth', allRouters.authRouters)
    app.use('/cart', allRouters.cartRouters)
    app.use('/order', allRouters.orderRouters)



    app.all('*', (req, res) => { res.status(404).json({ Message: "404 Not fount URL" }) })

    app.use(globalResponse)


    changeCouponStatusCron()

    //  ===> Uncomment it ,when you need to stop cron-jobs working
    gracefulShutdown()

    app.listen(port, () => { console.log(`...Server is running on Port ${port}`); })
}

