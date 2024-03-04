import { GraphQLObjectType, GraphQLString } from "graphql";
import { UUIDType } from "./uuid.js";
import { Post } from "@prisma/client";
import { Context } from "../schemas.js";

export const PostType = new GraphQLObjectType<Post, Context>({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    authorId: { type: UUIDType },
    content: { type: GraphQLString },
  }),
});
