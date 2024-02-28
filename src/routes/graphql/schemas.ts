import { Type } from '@fastify/type-provider-typebox';
import { buildSchema } from 'graphql'

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

const schemaString = `
  scalar UUID
  scalar MemberTypeId
  type MemberType {
    id: MemberTypeId!
    discount: Float
    postsLimitPerMonth: Float
  }
  type Post {
    id: UUID!
    title: String!
    content: String!
  }
  type Profile {
    id: UUID!
    isMale: Boolean!
    yearOfBirth: Int!
    memberType: MemberType
  }
   type User {
    id: UUID!
    name: String!
    balance: Float!
    profile: Profile
    posts: [Post]
  }
  type Query {
    memberTypes: [MemberType]
    posts: [Post]
    users: [User]
    profiles: [Profile]
    user(id: UUID!): User
    memberType(id: MemberTypeId!): MemberType
    post(id: UUID!): Post
    profile(id: UUID!): Profile
  }
`;


export const schema = buildSchema(schemaString);
