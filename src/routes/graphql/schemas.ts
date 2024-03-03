import { Type } from '@fastify/type-provider-typebox';
import { GraphQLSchema } from 'graphql'
import { PrismaClient } from '@prisma/client';
import { GraphQLObjectType } from "graphql";
import { post, posts } from "./fields/post.js";
import { profile, profiles } from "./fields/profile.js";
import { memberType, memberTypes } from "./fields/memberType.js";
import { changeUser, createUser, deleteUser, user, users } from "./fields/user.js";
import { changePost, createPost, deletePost } from "./fields/post.js";
import { changeProfile, createProfile, deleteProfile } from "./fields/profile.js";
import { subscribeTo, unsubscribeFrom } from './fields/subscribe.js';
import DataLoader from 'dataloader';


export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);
export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export interface Context {
  db: PrismaClient,
  userSubscribedToCache: DataLoader<string, unknown>
  subscribedToUserCache: DataLoader<string, unknown>
}



export const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    memberType,
    memberTypes,
    post,
    posts,
    user,
    users,
    profile,
    profiles,
  }),
});

export const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    changePost: changePost,
    createPost: createPost,
    deletePost: deletePost,
    changeProfile,
    createProfile,
    deleteProfile,
    changeUser,
    createUser,
    deleteUser,
    subscribeTo,
    unsubscribeFrom
  }),
});

export const schema = new GraphQLSchema({ query: QueryType, mutation: MutationType });
