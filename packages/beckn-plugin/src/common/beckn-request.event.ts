import { RequestContext, VendureEvent } from '@vendure/core';

export class BecknRequestEvent extends VendureEvent {
    constructor(public ctx: RequestContext) {
        super();
    }
}
