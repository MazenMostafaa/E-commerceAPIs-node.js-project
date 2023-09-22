import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";


export const imageType = new GraphQLObjectType({
    name: "imageType",
    description: "returning of a object of an image from DB",
    fields: {
        secure_url: { type: GraphQLString },
        public_id: { type: GraphQLString }
    }
})

export const subCategoryType = new GraphQLObjectType({
    name: "subCategoryType",
    description: "returning of subCategories from DB",
    fields: {
        name: { type: GraphQLString },
        slug: { type: GraphQLString },
        createdBy: { type: GraphQLID },
        Image: { type: imageType }
    }
})

export const categoryType = new GraphQLObjectType({
    name: "categoryType",
    description: "returning of categories from DB",
    fields: {
        name: { type: GraphQLString },
        slug: { type: GraphQLString },
        createdBy: { type: GraphQLID },
        Image: { type: imageType },
        subCategories: { type: new GraphQLList(subCategoryType) }
    }
})
