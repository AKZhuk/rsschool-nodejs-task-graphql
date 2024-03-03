import { GraphQLFieldConfig, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLBoolean, GraphQLInt } from "graphql";
import { ProfileType } from "../types/profile.js";
import { UUIDType } from "../types/uuid.js";
import { Context } from "../schemas.js";
import { ArgsId, ChangeArgs, CreateArgs } from "./types.js";
import { Profile } from "@prisma/client";
import { MemberTypeIdType } from "../types/memberTypeId.js";

export const profile: GraphQLFieldConfig<void, Context, ArgsId> = {
  type: ProfileType,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_src, { id }, { db }) =>
    db.profile.findUnique({ where: { id: id } }),
};

export const profiles: GraphQLFieldConfig<void, Context, void> = {
  type: new GraphQLNonNull(new GraphQLList(ProfileType)),
  resolve: (_src, _, { db }) => db.profile.findMany(),
};


const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    memberTypeId: { type: MemberTypeIdType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});

export const changeProfile: GraphQLFieldConfig<void, Context, ChangeArgs<Profile>> = {
  type: ProfileType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
  },
  resolve: (_src, args, { db }) =>
    db.profile.update({ where: { id: args.id }, data: args.dto }),
};


const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdType) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
  }),
});



export const createProfile: GraphQLFieldConfig<void, Context, CreateArgs<Profile>> = {
  type: ProfileType,
  args: { dto: { type: new GraphQLNonNull(CreateProfileInputType) } },
  resolve: (_src, args, { db }) => db.profile.create({ data: args.dto }),
};

export const deleteProfile: GraphQLFieldConfig<void, Context, ArgsId> = {
  type: new GraphQLNonNull(UUIDType),
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (_src, { id }, { db }) => {
    const profile = await db.profile.delete({ where: { id: id } });
    return profile.id;
  },
};