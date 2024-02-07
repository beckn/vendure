import { readJSON } from 'fs-extra';
import path from 'path';
import { expect } from 'vitest';

export type ReqResTestConfig = {
    queryName: string;
    reqJSONFile: string;
    resJSONFile: string;
    exclude: [string];
};

export async function readTestConfiguration(domain: string) {
    return await readJSON(path.join(__dirname, 'fixtures', 'test-configurations', `${domain}.json`));
}

export async function readFixtureJSON(filename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', filename));
}

export async function readBecknRequestJSON(domain: string, filename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', 'beckn-requests', domain, filename));
}

export async function readBecknResponseJSON(domain: string, filename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', 'beckn-responses', domain, filename));
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
