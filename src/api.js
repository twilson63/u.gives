import "dotenv";
import { GraphQLHTTP } from "gql";
import { makeExecutableSchema } from "graphql_tools";
import { gql } from "graphql_tag";
import { connect } from "hyper-connect";

const hyper = connect(Deno.env.get("HYPER"));

const typeDefs = gql`
  input OrgInput {
    name: String
    code: String
    address: String
    email: String
    spl: String
  }

  type Org {
    _id: String
    type: String
    name: String
    code: String
    address: String
    email: String
    spl: String
  }
  type Result {
    ok: Boolean
  }
  type Query {
    org(code: String!) : Org
  }
  type Mutation {
    createOrg(input: OrgInput) : Result!
    updateOrg(id: ID!, input: OrgInput) : Result!
  }
`;


const resolvers = {
  Query: {
    org: (_parent, { code }) => Promise.resolve({}),
    count: () => Promise.resolve(1)
  },
  Mutation: {
    createOrg(_parent, { input }) {
      return Promise.resolve({ok: true});
    },
    updateOrg(_parent, { id, input }) {
      return Promise.resolve({ok : true})
    }
  },
};

/**
 * @param {Request} req
 */
export const graphql = async (req) =>
  await GraphQLHTTP({
    schema: makeExecutableSchema({ resolvers, typeDefs }),
    graphiql: true,
  })(req);


/**
 * @param {string} code
 */
export const org = async (code) => {
  const result = await hyper.data.query({ type: 'org', code });
  return result.docs[0] ? result.docs[0] : {};
};