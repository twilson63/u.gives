import "dotenv";
import { GraphQLHTTP } from "gql";
import { makeExecutableSchema } from "graphql_tools";
import { gql } from "graphql_tag";
import { connect } from "hyper-connect";
import { z } from 'zod'
import crocks from 'crocks'
import { compose, set, over, lensProp } from 'ramda'

const hyper = connect(Deno.env.get("HYPER"));
const { Async } = crocks 

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
    count : Int
  }
  type Mutation {
    createOrg(input: OrgInput) : Result!
    updateOrg(id: ID!, input: OrgInput) : Result!
  }
`;


const orgSchema = z.object({
  _id: z.string(),
  type: z.literal('org'),
  name: z.string(),
  description: z.string(),
  code: z.string(),
  address: z.string(),
  email: z.string(),
  spl: z.string()
})

const setDefaults = compose(
  // set Id
  over(lensProp('_id'), () => '1'),
  // set type
  set(lensProp('type'), 'org')
)

const validate = org => {
  const { success, data, errors } = orgSchema.safeParse(org)
  return success ? Async.Resolved(data) : Async.Rejected(errors)
}

const resolvers = {
  Query: {
    org: (_parent, { code }) => Promise.resolve({}),
    count: () => Promise.resolve(1)
  },
  Mutation: {
    createOrg(_parent, { input }) {
      return Async.of(input)
        .map(setDefaults)
        .chain(validate)
        .chain(org => Async.fromPromise(hyper.data.add)(org))

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