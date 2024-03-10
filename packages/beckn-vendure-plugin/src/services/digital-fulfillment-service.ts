import { Injectable } from '@nestjs/common';
import { Fulfillment, RequestContext, TransactionalConnection } from '@vendure/core';

@Injectable()
export class DigitalFulfillmentService {
    constructor(private connection: TransactionalConnection) {}

    async updateDigitalFulfillmentItem(
        ctx: RequestContext,
        fulfillmentId: string,
        index: number,
        state: string,
    ): Promise<Fulfillment | null> {
        try {
            const repo = this.connection.getRepository(ctx, Fulfillment);
            let fulfillment = await repo.findOneBy({
                id: fulfillmentId,
            });
            if (
                !fulfillment ||
                !fulfillment.customFields || //@ts-ignore
                !fulfillment.customFields.statuses || //@ts-ignore
                fulfillment.customFields.statuses[index] === undefined
            ) {
                return null;
            }

            // @ts-ignore
            fulfillment.customFields.statuses[index] = state;
            await repo.save(fulfillment);
            return fulfillment;
        } catch (err: any) {
            console.log(err.message);
            return null;
        }
    }
}
