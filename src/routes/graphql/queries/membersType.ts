import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull } from 'graphql';
import { MemberTypeType } from '../types/memberType.js';
import { Context } from '../schemas.js';

export const memberTypes: GraphQLFieldConfig<void, Context, void> = {
  type: new GraphQLNonNull(new GraphQLList(MemberTypeType)),
  resolve: (_src, _, { db }) => db.memberType.findMany(),
};