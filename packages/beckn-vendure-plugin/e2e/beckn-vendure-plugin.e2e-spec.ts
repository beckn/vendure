/* eslint-disable no-console */
import { SqljsInitializer, createTestEnvironment, registerInitializer, testConfig } from '@vendure/testing';
import { gql } from 'graphql-tag';
import path from 'path';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

import { BecknVendurePlugin } from '../src/beckn-vendure-plugin';
import { TransformerService } from '../src/transformer/transformer.service';
import { Environment } from '../src/types';

import { initialData } from './fixtures/e2e-initial-data';
import {
    ReqResTestConfig,
    readBecknRequestJSON,
    readBecknResponseJSON,
    readFixtureJSON,
    readTestConfiguration,
    strictEqualWithExclude,
} from './test-utils';

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

    describe('Transformer Service', () => {
        describe('transform method', () => {
            let env: Environment;
            beforeAll(async () => {
                env = await readFixtureJSON('transform-env.json');
            });

            describe('for retail:1.1.0', async () => {
                const domain = 'retail-1-1-0';
                const testConfigs: ReqResTestConfig[] = await readTestConfiguration(domain);

                let index = 0;
                for (const tc of testConfigs) {
                    index += 1;
                    // if (index !== testConfigs.length) continue; // DEV ENV - RUN ONLY LAST TEST- TO BE REMOVED AFTER DEV
                    it(`works for ${tc.queryName} query`, async () => {
                        const beckn_request = await readBecknRequestJSON(domain, tc.reqJSONFile);
                        const response = await transformerService.transform(env, beckn_request);
                        if (!tc.resJSONFile) {
                            expect(response).toBe(undefined);
                        } else {
                            const expectedResponse = await readBecknResponseJSON(domain, tc.resJSONFile);
                            strictEqualWithExclude(response, expectedResponse, tc.exclude);
                        }
                    });
                }
            });
        });
    });
});
