import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { GraphQLArgs, graphql } from 'graphql';
import { UUIDType } from './types/uuid.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {

  const root: GraphQLArgs["rootValue"] = {
    posts: () => fastify.prisma.post.findMany(),
    users: () => fastify.prisma.user.findMany({
      include: {
        posts: true,
        profile: true
      },
    }),
    memberTypes: () => fastify.prisma.memberType.findMany(),
    profiles: () => fastify.prisma.profile.findMany({
      include: {
        memberType: true
      },
    }),
    user: async ({ id }: { id: string }) => {

      const user = await fastify.prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          posts: true,
          profile: true,
          userSubscribedTo: true,
          subscribedToUser: true
        },
      });
      return user
    },
    post: async ({ id }: { id: string }) => {
      const post = await fastify.prisma.post.findUnique({
        where: {
          id: id,
        },
      });
      return post
    },
    profile: async ({ id }: { id: string }) => {
      const profile = await fastify.prisma.profile.findUnique({
        where: {
          id: id,
        },
      });
      return profile
    },
    memberType: async ({ id }: { id: string }) => {
      const memberType = await fastify.prisma.memberType.findUnique({
        where: {
          id: id,
        },
      });
      return memberType
    },
    UUIDType,
  };

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const result = await graphql({
        schema: schema,
        source: query,
        variableValues: variables,
        rootValue: root,
      });

      return result
    },
  });
};

export default plugin;

