import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from './uuid.js';
import { PostType } from './post.js';
import { ProfileType } from './profile.js';
import { Context } from '../schemas.js';
import { User } from '@prisma/client';
import DataLoader from 'dataloader';
import { groupData } from '../helpers.js';

export const UserType: GraphQLObjectType<User, Context> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (source: User, _, { db, cache }: Context) => {
        if (!cache.posts) {
          cache.posts = new DataLoader(async (ids: readonly string[]) => {
            const posts = await db.post.findMany({
              where: { authorId: { in: [...ids] } },
            });
            const groupedPosts = groupData(posts, 'authorId');

            return ids.map((id) => groupedPosts[id]);
          });
        }
        return cache.posts.load(source.id);
      },
    },
    profile: {
      type: ProfileType,
      resolve: (source, _, { db, cache }) => {
        if (!cache.profile) {
          cache.profile = new DataLoader(async (ids: readonly string[]) => {
            const profiles = await db.profile.findMany({
              where: { userId: { in: [...ids] } },
            });

            return ids.map((id) => profiles.find((profile) => profile.userId === id));
          });
        }

        return cache.profile.load(source.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (source, _args, { db, cache }) => {
        if (!cache.userSubscribedTo) {
          cache.userSubscribedTo = new DataLoader(async (ids: readonly string[]) => {
            const authors = await db.user.findMany({
              where: {
                subscribedToUser: {
                  some: {
                    subscriberId: { in: [...ids] },
                  },
                },
              },
              include: {
                subscribedToUser: true,
              },
            });
            const authorsGrouped = groupData(authors, 'subscribedToUser', "subscriberId")
            return ids.map((id) => authorsGrouped[id]);
          });
        }

        return cache.userSubscribedTo.load(source.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (source, _args, { db, cache }) => {
        if (!cache.subscribedToUser) {
          cache.subscribedToUser = new DataLoader(async (ids: readonly string[]) => {
            const subscribers = await db.user.findMany({
              where: {
                userSubscribedTo: {
                  some: {
                    authorId: { in: [...ids] },
                  },
                },
              },
              include: {
                userSubscribedTo: true,
              },
            });

            const grouped = groupData(subscribers, 'userSubscribedTo', 'authorId');
            return ids.map((id) => grouped[id]);
          });
        }
        return cache.subscribedToUser.load(source.id);
      },
    },
  }),
});
