import gql from 'graphql-tag';

export const shopApiExtensions = gql`
    type BecknTransaction implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        becknTransactionId: String!
        vendureAuthToken: String!
    }

    extend type Query {
        getBecknTransaction(becknTransactionId: String!): BecknTransaction
        getBecknTransactionFromOrderId(orderId: String!): BecknTransaction
    }

    extend type Mutation {
        addBecknTransaction(becknTransactionId: String!, vendureAuthToken: String!): BecknTransaction!
    }
`;
