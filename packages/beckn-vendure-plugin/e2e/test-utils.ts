import { readJSON, readdir } from 'fs-extra';
import path from 'path';
import { expect } from 'vitest';
import { SetupServerApi, setupServer } from 'msw/node';
import { GraphQLHandler, HttpResponse, graphql, http } from 'msw';

export type ReqResTestConfig = {
    queryName: string;
    reqJSONFile: string;
    resJSONFile: string;
    exclude: string[];
};

export async function readTestConfiguration(version: string) {
    return await readJSON(path.join(__dirname, 'fixtures', 'test-configurations', `${version}.json`));
}

export async function readFixtureJSON(filename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', filename));
}

export async function readBecknRequestJSON(version: string, filename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', 'beckn-requests', version, filename));
}

export async function readBecknResponseJSON(version: string, filename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', 'beckn-responses', version, filename));
}

export async function readVCRResponseJSON(version: string, request: string, graphQLResponseFilename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', 'vcr', version, request, graphQLResponseFilename));
}

export function strictEqualWithExclude(obj: any, expectedObj: any, exclude: string[] = []) {
    for (const key of exclude) {
        deleteKey(obj, key);
        deleteKey(expectedObj, key);
    }
    expect(JSON.stringify(obj)).toBe(JSON.stringify(expectedObj));
    // expect(obj).toStrictEqual(expectedObj);
}

export function deleteKey(obj: any, key: string) {
    const keys = key.split('.');
    const length = keys.length;
    let tObj = obj;
    for (let i = 0; i < length - 1; i++) {
        if (tObj === undefined) return;
        tObj = tObj[keys[i]];
    }
    delete tObj[keys[length - 1]];
}

export async function setupVCR(version: string, request: string) {
    const graphqlRequests = new Map<string, string>();
    let graphqlResponseFilenames: string[] = [];
    try {
        graphqlResponseFilenames = await readdir(path.join(__dirname, 'fixtures', 'vcr', version, request));
    } catch {
        graphqlResponseFilenames = [];
    }

    graphqlResponseFilenames.forEach(fn => {
        graphqlRequests.set(fn.split('Response.json')[0], fn);
    });

    const graphqlHandlers: GraphQLHandler[] = [];
    for (const [graphqlRequest, graphqlResponseFilename] of graphqlRequests) {
        const response = await readVCRResponseJSON(version, request, graphqlResponseFilename);
        graphqlHandlers.push(
            graphql.query(graphqlRequest, () => {
                return HttpResponse.json(response);
            }),
            graphql.mutation(graphqlRequest, () => {
                return HttpResponse.json(response);
            }),
        );
    }
    const server = setupServer(...graphqlHandlers);
    // server.listen({ onUnhandledRequest: 'error' });
    return server;
}
