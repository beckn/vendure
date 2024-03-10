import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Ctx, Fulfillment, RequestContext, Transaction } from '@vendure/core';
import { DigitalFulfillmentService } from '../services/digital-fulfillment-service';

@Resolver()
export class DigitalFulfillmentResolver {
    constructor(private digitalFulfillmentService: DigitalFulfillmentService) {}
    @Transaction()
    @Mutation()
    async updateDigitalFulfillmentLine(
        @Ctx() ctx: RequestContext,
        @Args()
        { fulfillmentId, index, state }: { fulfillmentId: string; index: number; state: string },
    ): Promise<Fulfillment | null> {
        const fulfillment = await this.digitalFulfillmentService.updateDigitalFulfillmentItem(
            ctx,
            fulfillmentId,
            index,
            state,
        );
        return fulfillment;
    }
}
