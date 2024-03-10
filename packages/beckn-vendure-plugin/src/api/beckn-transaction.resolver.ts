import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
    Ctx,
    RequestContext,
    Allow,
    Permission,
    Transaction,
    Relations,
    RelationPaths,
    Order,
    OrderService,
    ErrorResultUnion,
    ProductVariantService,
} from '@vendure/core';

import { BecknTransactionService } from '../services/beckn-transaction-service';
import { CancelOrderInput, CancelOrderResult } from '@vendure/common/lib/generated-types';

@Resolver()
export class BecknTransactionResolver {
    constructor(
        private becknTransactionService: BecknTransactionService,
        private orderService: OrderService,
        private productVariantService: ProductVariantService,
    ) {}

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
    async getBecknTransactionFromVendureAuthToken(
        @Ctx() ctx: RequestContext,
        @Args() { vendureAuthToken }: { vendureAuthToken: string },
    ) {
        return this.becknTransactionService.getBecknTransactionFromVendureAuthToken(ctx, vendureAuthToken);
    }

    @Query()
    @Allow(Permission.Public)
    async getVendureToken(@Ctx() ctx: RequestContext, @Args() { becknOrderId }: { becknOrderId: string }) {
        const becknTransaction = await this.becknTransactionService.getBecknTransactionFromVendureAuthToken(
            ctx,
            becknOrderId,
        );
        return becknTransaction?.vendureToken;
    }

    @Query()
    @Allow(Permission.Public)
    async getBecknOrder(
        @Ctx() ctx: RequestContext,
        @Args() { becknOrderId }: { becknOrderId: string },
        @Relations(Order) relations: RelationPaths<Order>,
    ): Promise<Order | undefined> {
        const becknTransaction = await this.becknTransactionService.getBecknTransactionFromVendureAuthToken(
            ctx,
            becknOrderId,
        );
        if (!becknTransaction || !becknTransaction.vendureOrderId)
            throw new Error('No order id for the given becknOrderId. How did this happen?');
        const order = await this.orderService.findOne(ctx, becknTransaction.vendureOrderId, relations);
        if (order) return order;
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

    @Mutation()
    @Transaction()
    @Allow(Permission.Public)
    async addVendureOrderIdToBecknTransaction(
        @Ctx() ctx: RequestContext,
        @Args()
        {
            vendureAuthToken,
            vendureOrderId,
            vendureToken,
        }: { vendureAuthToken: string; vendureOrderId: string; vendureToken: string },
    ) {
        return this.becknTransactionService.addVendureOrderIdToBecknTransaction(
            ctx,
            vendureAuthToken,
            vendureOrderId,
            vendureToken,
        );
    }

    @Transaction()
    @Mutation()
    async cancelBecknOrder(
        @Ctx() ctx: RequestContext,
        @Args()
        {
            becknOrderId,
            reason,
            cancelShipping = true,
        }: { becknOrderId: string; reason: string; cancelShipping: boolean },
    ): Promise<ErrorResultUnion<CancelOrderResult, Order>> {
        const becknTransaction = await this.becknTransactionService.getBecknTransactionFromVendureAuthToken(
            ctx,
            becknOrderId,
        );
        if (!becknTransaction || !becknTransaction.vendureOrderId)
            throw new Error('No order id for the given becknOrderId. How did this happen?');

        const cancelOrderInput: CancelOrderInput = {
            orderId: becknTransaction.vendureOrderId,
            reason: reason,
            cancelShipping: cancelShipping,
        };
        const retVal = await this.orderService.cancelOrder(ctx, cancelOrderInput);
        return retVal;
    }
}
