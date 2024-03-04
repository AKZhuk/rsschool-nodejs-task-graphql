import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull } from 'graphql';
import { MemberTypeType } from '../types/memberType.js';
import { Context } from '../schemas.js';
import { ArgsId } from './types.js';
import { MemberTypeIdType } from '../types/memberTypeId.js';

export const memberTypes: GraphQLFieldConfig<void, Context, void> = {
  type: new GraphQLNonNull(new GraphQLList(MemberTypeType)),
  resolve: (_src, _, { db }) => db.memberType.findMany(),
};

export const memberType: GraphQLFieldConfig<void, Context, ArgsId> = {
  type: MemberTypeType,
  args: { id: { type: new GraphQLNonNull(MemberTypeIdType) } },
  resolve: (_source, args, { db }) =>
    db.memberType.findUnique({ where: { id: args.id } }),
};

