/* eslint-disable no-console */
import { SqljsInitializer, createTestEnvironment, registerInitializer, testConfig } from '@vendure/testing';
import { gql } from 'graphql-tag';
import path from 'path';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

import { BecknVendurePlugin } from '../src/beckn-vendure-plugin';
import { TransformerService } from '../src/transformer/transformer.service';
import { Environment } from '../src/types';

import { initialData } from './fixtures/e2e-initial-data';
import { ReqResTestConfig, readBecknRequestJSON, readBecknResponseJSON, readFixtureJSON } from './test-utils';

const sqliteDataDir = path.join(__dirname, '__data__');

registerInitializer('sqljs', new SqljsInitializer(sqliteDataDir));

describe('beckn-vendure-plugin', () => {
    const { server, adminClient, shopClient } = createTestEnvironment({
        ...testConfig,
        plugins: [BecknVendurePlugin],
    });

    let transformerService: TransformerService;

    beforeAll(async () => {
        await server.init({
            productsCsvPath: path.join(__dirname, 'fixtures/e2e-products.csv'),
            initialData,
            customerCount: 2,
        });
        await adminClient.asSuperAdmin();
        transformerService = server.app.get(TransformerService);
    }, 60000);

    afterAll(async () => {
        await server.destroy();
    });

    // it('sample product query returns the expected result', async () => {
    //     await adminClient.asSuperAdmin(); // log in as the SuperAdmin user
    //     const query = gql`
    //         query Product($id: ID!) {
    //             product(id: $id) {
    //                 name
    //             }
    //         }
    //     `;
    //     const result = await adminClient.query(query, { id: 1 });

    //     expect(result.product).toEqual({
    //         name: 'Laptop',
    //     });
    // });

    describe('Transformer Service', () => {
        describe('transform method', () => {
            let env: Environment;
            beforeAll(async () => {
                env = await readFixtureJSON('transform-env.json');
            });

            describe('for local-retail', () => {
                const domain = 'local-retail';
                const testConfigs: ReqResTestConfig[] = [
                    { queryName: 'search', reqJSONFile: 'search.json', resJSONFile: 'on-search.json' },
                    // { queryName: 'select', reqJSONFile: 'select.json', resJSONFile: 'on-select.json' },
                ];

                for (const tc of testConfigs) {
                    it(`works for ${tc.queryName} query`, async () => {
                        const beckn_request = {
                            headers: await readFixtureJSON('beckn-request-header.json'),
                            body: await readBecknRequestJSON(domain, tc.reqJSONFile),
                        };
                        const response = await transformerService.transform(env, beckn_request);
                        const expectedResponseBody = await readBecknResponseJSON(domain, tc.resJSONFile);
                        expect(response.body).toStrictEqual(expectedResponseBody);
                    });
                }
            });
        });
    });
});
