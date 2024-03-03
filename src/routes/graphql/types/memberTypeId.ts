import { GraphQLScalarType, Kind } from "graphql";

enum MemberTypes {
  basic,
  business
}

const ErrorMessage = "Invalid MemberTypeId"

const isMemberTypeId = (value: unknown) =>
  value === MemberTypes.basic || value === MemberTypes.business;

export const MemberTypeIdType = new GraphQLScalarType({
  name: 'MemberTypeId',
  serialize(value) {
    if (!isMemberTypeId(value)) {
      throw new TypeError(ErrorMessage);
    }
    return value;
  },
  parseValue(value) {
    if (!isMemberTypeId(value)) {
      throw new TypeError(ErrorMessage);
    }
    return value;
  },
  parseLiteral(valueNode) {
    if (valueNode.kind === Kind.STRING && isMemberTypeId(valueNode.value)) {
      return valueNode.value;
    }
  },
});

