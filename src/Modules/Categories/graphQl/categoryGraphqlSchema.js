import { GraphQLObjectType, GraphQLSchema } from "graphql";

import * as categoryResolvers from './categoryGraphqlResolver.js'


export const categoryGraphqlSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "categoryQuerySchema",
        description: "This is main query schema in category module",
        fields: {
            getAllCategory: categoryResolvers.getAllCategory
        }
    })
})