import { OrderProcess, OrderService } from '@vendure/core';

import { digitalFulfillmentHandler } from './digital-fulfillment-handler';

let orderService: OrderService;

/**
 * @description
 * This OrderProcess ensures that when an Order transitions from ArrangingPayment to
 * PaymentAuthorized or PaymentSettled, then any digital products are automatically
 * fulfilled.
 */
export const digitalOrderProcess: OrderProcess<string> = {
    init(injector) {
        orderService = injector.get(OrderService);
    },
    async onTransitionEnd(fromState, toState, data) {
        try {
            console.log(`Transitioning from ${fromState} to ${toState}`);
            if (toState === 'ArrangingPayment') {
                const digitalOrderLines = data.order.lines.filter(
                    l => l.productVariant.customFields.isDigital,
                );
                if (digitalOrderLines.length && data.order.totalWithTax === 0) {
                    console.log('Changing state to PaymentSettled for zero dollar orders');
                    setTimeout(
                        async () =>
                            await orderService.transitionToState(data.ctx, data.order.id, 'PaymentSettled'),
                        2000,
                    );
                }
            }
            if (
                fromState === 'ArrangingPayment' &&
                (toState === 'PaymentAuthorized' || toState === 'PaymentSettled')
            ) {
                console.log('Creating Fulfillment for the order');
                const digitalOrderLines = data.order.lines.filter(
                    l => l.productVariant.customFields.isDigital,
                );
                if (digitalOrderLines.length) {
                    await orderService.createFulfillment(data.ctx, {
                        lines: digitalOrderLines.map(l => ({ orderLineId: l.id, quantity: l.quantity })),
                        handler: { code: digitalFulfillmentHandler.code, arguments: [] },
                    });
                }
            }
        } catch (err) {
            console.log(JSON.stringify(err));
        }
    },
};
