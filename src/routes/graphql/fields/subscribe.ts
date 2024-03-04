import { GraphQLFieldConfig, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { UserType } from '../types/user.js';
import { UUIDType } from '../types/uuid.js';
import { Context } from '../schemas.js';

interface Args {
  userId: string;
  authorId: string;
}

const args = {
  userId: { type: new GraphQLNonNull(UUIDType) },
  authorId: { type: new GraphQLNonNull(UUIDType) },
};

export const subscribeTo: GraphQLFieldConfig<void, Context, Args> = {
  type: UserType as GraphQLObjectType,
  args: args,

  resolve: (_src, args, { db }) => {
    const result = db.user.update({
      where: {
        id: args.userId,
      },
      data: {
        userSubscribedTo: {
          create: {
            authorId: args.authorId,
          },
        },
      },
    });

    return result;
  },
};


export const unsubscribeFrom: GraphQLFieldConfig<void, Context, Args> = {
  type: UUIDType,
  args: args,

  resolve: async (_src, args, { db }) => {
    const { authorId } = await db.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      },
    });

    return authorId;
  },
};