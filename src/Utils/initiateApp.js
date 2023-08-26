
import { globalResponse } from './asyncHandler.js'
import { connectDB } from '../../DB/connection.js'
import * as allRouters from '../Modules/index.routers.js'

export const initiateApp = (app, express) => {

    const port = process.env.PORT

    connectDB()
    app.use(express.json())


    app.use('/category', allRouters.categoryRouters)
    app.use('/subCategory', allRouters.subCategoryRouters)
    app.use('/brand', allRouters.brandRouters)
    app.use('/product', allRouters.productRouters)
    app.use('/coupon', allRouters.couponRouter)
    app.use('/auth', allRouters.authRouters)


    app.get('/', (req, res) => res.send('Hello There in our site! '))
    app.all('*', (req, res) => { res.status(404).json({ Message: "404 Not fount URL" }) })

    app.use(globalResponse)

    app.listen(port, () => { console.log(`...Server is running on Port ${port}`); })
}

