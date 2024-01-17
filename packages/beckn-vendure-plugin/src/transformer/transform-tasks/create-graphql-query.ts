import assert from 'assert';
import { TransformTask, TransformTaskDef } from '../types';

export class CreateGraphQLQuery implements TransformTask {
    constructor(public taskDef: TransformTaskDef) {}
    private inputKey: string;
    private outputKey: string;
    async preCheck(context: any): Promise<boolean> {
        this.inputKey = this.taskDef.args?.input || 'beckn_request';
        this.outputKey = this.taskDef.args?.output || 'graphql_request';
        return true;
    }
    async run(context: any): Promise<void> {
        const item_to_search: string = context[this.inputKey]?.body?.message?.intent?.item?.descriptor?.name;
        // console.log(JSON.stringify(context.ctx.req?.body));
        context[this.outputKey] = {
            headers: { 'content-type': 'application/json' },
            query: `query Search {
                search(input: { term: "${item_to_search}" }) {
                    totalItems
                    items {
                        sku
                        slug
                        productVariantId
                        productVariantName
                        price {
                            ... on SinglePrice {
                                value
                            }
                            ... on PriceRange {
                                min
                                max
                            }
                        }
                        currencyCode
                    }
                }
            }
            `,
        };
    }
}
