/* eslint-disable no-console */
import { SqljsInitializer, createTestEnvironment, registerInitializer, testConfig } from '@vendure/testing';
import { gql } from 'graphql-tag';
import path from 'path';
import { afterAll, beforeAll, describe, it, expect, beforeEach, afterEach } from 'vitest';

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
    setupVCR,
    strictEqualWithExclude,
} from './test-utils';
import { SetupServerApi, setupServer } from 'msw/node';
import { HttpResponse, graphql, http } from 'msw';
import { TROUBLESHOOTING_MODE } from '../src/constants';

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
                (env['transformationsFolder'] = path.join(__dirname, '..', 'transformations')),
                    (env['versionTransformationsConfigFile'] = path.join(
                        __dirname,
                        '..',
                        'transformations',
                        'version-map.json',
                    ));
            });

            describe('for version 1.1.0', async () => {
                const version = '1-1-0';
                const testConfigs: ReqResTestConfig[] = await readTestConfiguration(version);

                let index = 0;
                for (const tc of testConfigs) {
                    index += 1;
                    if (TROUBLESHOOTING_MODE) if (index !== testConfigs.length) continue; // Comment this to run all tests. Else runs only last
                    it(`works for ${tc.queryName} query`, async () => {
                        let server = null;
                        try {
                            server = await setupVCR(version, tc.queryName);
                            const beckn_request = await readBecknRequestJSON(version, tc.reqJSONFile);
                            const response = await transformerService.transform(env, beckn_request);
                            if (!tc.resJSONFile) {
                                expect(response).toBe(undefined);
                            } else {
                                const expectedResponse = await readBecknResponseJSON(version, tc.resJSONFile);
                                strictEqualWithExclude(response, expectedResponse, tc.exclude);
                            }
                        } finally {
                            if (server) server.close();
                        }
                    });
                }
            });
        });
    });
});
