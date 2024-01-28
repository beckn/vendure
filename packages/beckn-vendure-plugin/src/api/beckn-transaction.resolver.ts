import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Ctx, RequestContext, Allow, Permission, Transaction } from '@vendure/core';

import { BecknTransactionService } from '../services/beckn-transaction-service';

@Resolver()
export class BecknTransactionResolver {
    constructor(private becknTransactionService: BecknTransactionService) {}

    @Query()
    @Allow(Permission.Public)
    async getBecknTransaction(
        @Ctx() ctx: RequestContext,
        @Args() { becknTransactionId }: { becknTransactionId: string },
    ) {
        return this.becknTransactionService.getBecknTransaction(ctx, becknTransactionId);
    }

    @Query()
    @Allow(Permission.Public)
    async getBecknTransactionFromOrderId(
        @Ctx() ctx: RequestContext,
        @Args() { orderId }: { orderId: string },
    ) {
        return this.becknTransactionService.getBecknTransactionFromOrderId(ctx, orderId);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.Public)
    async addBecknTransaction(
        @Ctx() ctx: RequestContext,
        @Args()
        { becknTransactionId, vendureAuthToken }: { becknTransactionId: string; vendureAuthToken: string },
    ) {
        return this.becknTransactionService.setBecknTransaction(ctx, becknTransactionId, vendureAuthToken);
    }
}
