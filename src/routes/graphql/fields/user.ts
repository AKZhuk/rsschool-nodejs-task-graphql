import { GraphQLFieldConfig, GraphQLFloat, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { Context } from '../schemas.js';
import { UserType } from '../types/user.js';
import { ArgsId, ChangeArgs, CreateArgs } from './types.js';
import { UUIDType } from '../types/uuid.js';
import { User } from '@prisma/client';
import DataLoader from 'dataloader';
import { ResolveTree, parseResolveInfo, simplifyParsedResolveInfoFragmentWithType } from 'graphql-parse-resolve-info';
import { groupData } from '../helpers.js';

export const users: GraphQLFieldConfig<void, Context, void> = {
  type: new GraphQLNonNull(new GraphQLList(UserType)),
  resolve: async (_src, _, { cache, db }, resolveInfo) => {

    const parsedResolveInfoFragment = parseResolveInfo(resolveInfo);
    const { fields } = simplifyParsedResolveInfoFragmentWithType(
      parsedResolveInfoFragment as ResolveTree,
      UserType
    ) as unknown as {
      fields: {
        userSubscribedTo,
        subscribedToUser
      }
    }

    const usersData = await db.user.findMany({
      include: {
        userSubscribedTo: !!fields.userSubscribedTo,
        subscribedToUser: !!fields.subscribedToUser,
      }
    })

    if (fields.userSubscribedTo) {
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

      usersData.forEach((user) => cache.userSubscribedTo.prime(user.id, user.userSubscribedTo));
    }

    if (fields.subscribedToUser) {
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

      usersData.forEach((user) => cache.subscribedToUser.prime(user.id, user.userSubscribedTo));
    }


    return usersData

  },
}

export const user: GraphQLFieldConfig<void, Context, ArgsId> = {
  type: UserType,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_src, { id }, { db }) => db.user.findUnique({ where: { id: id } }),
};


const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLInt },
  }),
});

export const changeUser: GraphQLFieldConfig<void, Context, ChangeArgs<User>> = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangeUserInputType) },
  },
  resolve: (_src, args, { db }) =>
    db.user.update({ where: { id: args.id }, data: args.dto }),
};


const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const createUser: GraphQLFieldConfig<void, Context, CreateArgs<User>> = {
  type: UserType,
  args: { dto: { type: new GraphQLNonNull(CreateUserInputType) } },
  resolve: (_src, args, { db }) => db.user.create({ data: args.dto }),
};

export const deleteUser: GraphQLFieldConfig<void, Context, ArgsId> = {
  type: new GraphQLNonNull(UUIDType),
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (_src, args, { db }) => {
    const user = await db.user.delete({ where: { id: args.id } });
    return user.id;
  },
};