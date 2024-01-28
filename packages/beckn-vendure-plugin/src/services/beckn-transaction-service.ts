import { Injectable } from '@nestjs/common';
import { RequestContext, TransactionalConnection } from '@vendure/core';

import { BecknTransaction } from '../entities/beckn-transaction.entity';

@Injectable()
export class BecknTransactionService {
    constructor(private connection: TransactionalConnection) {}
    async getBecknTransaction(ctx: RequestContext, becknId: string): Promise<BecknTransaction | null> {
        return await this.connection.getRepository(ctx, BecknTransaction).findOneBy({
            becknTransactionId: becknId,
        });
    }

    async getBecknTransactionFromOrderId(
        ctx: RequestContext,
        orderId: string,
    ): Promise<BecknTransaction | null> {
        return await this.connection.getRepository(ctx, BecknTransaction).findOneBy({
            vendureAuthToken: orderId,
        });
    }

    async setBecknTransaction(
        ctx: RequestContext,
        becknId: string,
        vendureAuthToken: string,
    ): Promise<BecknTransaction> {
        let becknTransaction = await this.connection.getRepository(ctx, BecknTransaction).findOneBy({
            becknTransactionId: becknId,
        });
        if (!becknTransaction) becknTransaction = new BecknTransaction();
        becknTransaction.becknTransactionId = becknId;
        becknTransaction.vendureAuthToken = vendureAuthToken;
        return await this.connection.getRepository(ctx, BecknTransaction).save(becknTransaction);
    }
}
