import { categoryModel } from '../../../../DB/Models/category.model.js'
import { GraphQLList } from "graphql"
import { categoryType } from './categoryGraphqlTypies.js'


export const getAllCategory = {
    type: new GraphQLList(categoryType),
    resolve: async () => {
        const categories = await categoryModel.find().populate([{
            path: "subCategories",
        }])
        return categories
    }
}