import { Injectable } from '@nestjs/common';
import { Customer, RequestContext, TransactionalConnection } from '@vendure/core';

@Injectable()
export class CustomCustomerService {
    constructor(private connection: TransactionalConnection) {}
    async getCustomer(ctx: RequestContext, email: string): Promise<Customer | null> {
        return await this.connection.getRepository(ctx, Customer).findOneBy({
            emailAddress: email,
        });
    }
}
