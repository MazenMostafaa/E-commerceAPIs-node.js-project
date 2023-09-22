import { GraphQLString } from "graphql"


export const getAllCategory = {
    type: GraphQLString,
    resolve: () => {
        return "you are now in the get all Categ graphQl API"
    }
}