import { userModel } from '../../DB/Models/user.model.js'
import { generateToken, verifyToken } from '../Utils/tokenFunctions.js'


export const isAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(400).json({ message: 'Please login first' })
        }

        if (!authorization.startsWith('ecommerce__')) {
            return res.status(400).json({ message: 'invalid token prefix' })
        }

        const splitedToken = authorization.split(' ')[1]

        try {
            const decodedData = verifyToken({
                token: splitedToken,
                signature: process.env.SIGN_IN_TOKEN_SECRET,
            })

            const findUser = await userModel.findById(decodedData._id)
            if (!findUser) {
                return res.status(400).json({ message: 'Please SignUp' })
            }

            req.authUser = findUser
            return next()
        } catch (error) {

            if (error == 'TokenExpiredError: jwt expired') {

                const user = await userModel.findOne({ token: splitedToken })

                if (!user) {
                    return res.status(400).json({ Message: "Wrong Token" })
                }


                const userToken = generateToken({
                    payload: { _id: user._id, role: user.role, email: user.email },
                    signature: process.env.SIGN_IN_TOKEN_SECRET,
                    expiresIn: "2d",
                })

                if (!userToken) {
                    return next(
                        new Error('token generation fail, payload canot be empty', {
                            cause: 400,
                        }),
                    )
                }

                await userModel.findOneAndUpdate(
                    { token: splitedToken },
                    { token: userToken },
                    { new: true }
                )
                return res.status(201).json({ Message: "Token is refreshed", newToken: userToken })
            }
            return res.status(400).json({ Message: "In-valid Token" })
        }

    } catch (error) {
        console.log(error);
        next(new Error('Catch error in authentication token layer', { cause: 500 }))
    }
}