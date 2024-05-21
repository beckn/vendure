import { Args, Query, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext } from '@vendure/core';
import { CustomCustomerService } from '../services/customer-service';

@Resolver()
export class CustomerResolver {
    constructor(private customCustomerService: CustomCustomerService) {}

    @Query()
    getCustomer(@Ctx() ctx: RequestContext, @Args() args: { email: string }) {
        return this.customCustomerService.getCustomer(ctx, args.email);
    }
}
