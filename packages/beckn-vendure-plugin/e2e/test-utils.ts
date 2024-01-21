import { readJSON } from 'fs-extra';
import path from 'path';

export type ReqResTestConfig = {
    queryName: string;
    reqJSONFile: string;
    resJSONFile: string;
};

export async function readFixtureJSON(filename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', filename));
}

export async function readBecknRequestJSON(domain: string, filename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', 'beckn-requests', domain, filename));
}

export async function readBecknResponseJSON(domain: string, filename: string) {
    return await readJSON(path.join(__dirname, 'fixtures', 'beckn-responses', domain, filename));
}
