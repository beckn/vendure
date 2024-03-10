import gql from 'graphql-tag';

export const shopApiExtensions = gql`
    type BecknTransaction implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        becknTransactionId: String!
        vendureAuthToken: String!
        vendureOrderId: String
        vendureToken: String
    }

    type ProductVariantWithChannelAndSeller implements Node {
        channels: [Channel]
        options: [ProductOption]
        id: ID!
        name: String
        product: Product
    }

    type ProductVariantWithChannelAndSellerList implements PaginatedList {
        items: [ProductVariantWithChannelAndSeller!]!
        totalItems: Int!
    }

    extend type Query {
        getBecknTransaction(becknTransactionId: String!): BecknTransaction
        getBecknTransactionFromVendureAuthToken(vendureAuthToken: String!): BecknTransaction
        getVendureToken(becknOrderId: String!): String
        getBecknOrder(becknOrderId: String!): Order
        getProductVariantDetails(
            options: ProductVariantListOptions
            productId: ID
        ): ProductVariantWithChannelAndSellerList!
    }

    extend type Mutation {
        addBecknTransaction(becknTransactionId: String!, vendureAuthToken: String!): BecknTransaction!
        addVendureOrderIdToBecknTransaction(
            vendureAuthToken: String!
            vendureOrderId: String!
            vendureToken: String!
        ): BecknTransaction!
        cancelBecknOrder(becknOrderId: String!, reason: String!, cancelShipping: Boolean): Order
        updateDigitalFulfillmentLine(fulfillmentId: String!, index: Int!, state: String!): Fulfillment
    }
`;
