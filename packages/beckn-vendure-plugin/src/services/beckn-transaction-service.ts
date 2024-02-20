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

    async getBecknTransactionFromVendureAuthToken(
        ctx: RequestContext,
        vendureAuthToken: string,
    ): Promise<BecknTransaction | null> {
        return await this.connection.getRepository(ctx, BecknTransaction).findOneBy({
            vendureAuthToken: vendureAuthToken,
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

    async addVendureOrderIdToBecknTransaction(
        ctx: RequestContext,
        vendureAuthToken: string,
        vendureOrderId: string,
        vendureToken: string,
    ): Promise<BecknTransaction> {
        let becknTransaction = await this.connection.getRepository(ctx, BecknTransaction).findOneBy({
            vendureAuthToken: vendureAuthToken,
        });
        if (!becknTransaction) throw Error('Cannot add VendureOrderId to non-existant BecknTransaction');
        becknTransaction.vendureOrderId = vendureOrderId;
        becknTransaction.vendureToken = vendureToken;
        return await this.connection.getRepository(ctx, BecknTransaction).save(becknTransaction);
    }
}
