import {
  GraphQLFieldConfig, GraphQLList, GraphQLNonNull, GraphQLInputObjectType,
  GraphQLString,
} from "graphql";
import { PostType } from "../types/post.js";
import { UUIDType } from "../types/uuid.js";
import { Context } from "../schemas.js";
import { Post } from '@prisma/client';
import { ArgsId, ChangeArgs, CreateArgs } from "./types.js";

export const post: GraphQLFieldConfig<void, Context, ArgsId> = {
  type: PostType,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_src, { id }, { db }) =>
    db.post.findUnique({ where: { id: id } }),
};

export const posts: GraphQLFieldConfig<void, Context, void> = {
  type: new GraphQLNonNull(new GraphQLList(PostType)),
  resolve: (_src, _, { db }) => db.post.findMany(),
};

const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    authorId: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

export const changePost: GraphQLFieldConfig<void, Context, ChangeArgs<Post>> = {
  type: PostType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangePostInputType) },
  },
  resolve: (_, { dto, id }, { db }) =>
    db.post.update({ where: { id: id }, data: dto }),
};


const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    authorId: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const createPost: GraphQLFieldConfig<void, Context, CreateArgs<Post>> = {
  type: PostType,
  args: { dto: { type: new GraphQLNonNull(CreatePostInputType) } },
  resolve: (_, { dto }, { db }) => db.post.create({ data: dto }),
};

export const deletePost: GraphQLFieldConfig<void, Context, ArgsId> = {
  type: new GraphQLNonNull(UUIDType),
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (_, { id }, { db }) => {
    const post = await db.post.delete({ where: { id: id } });
    return post.id;
  },
};