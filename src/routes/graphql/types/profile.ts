import { Profile } from '@prisma/client';
import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberTypeType } from './memberType.js';
import { MemberTypeIdType } from './memberTypeId.js';
import { Context } from '../schemas.js';
import DataLoader from 'dataloader';

export const ProfileType = new GraphQLObjectType<Profile, Context>({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    userId: { type: UUIDType },
    yearOfBirth: { type: GraphQLInt },
    isMale: { type: GraphQLBoolean },
    memberTypeId: { type: MemberTypeIdType },
    memberType: {
      type: new GraphQLNonNull(MemberTypeType),
      resolve: ({ memberTypeId }, _, { db, cache }) => {

        if (!cache.memberType) {
          cache.memberType = new DataLoader(async (ids: readonly string[]) => {
            const types = await db.memberType.findMany({
              where: { id: { in: [...ids] } },
            });
            return ids.map((id) => types.find((types) => types.id === id));
          });
        }

        return cache.memberType.load(memberTypeId);
      },
    },
  }),
});