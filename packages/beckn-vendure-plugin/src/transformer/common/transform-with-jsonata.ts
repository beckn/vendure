/* eslint-disable no-console */

import { readFile } from 'fs/promises';
import jsonata from 'jsonata';

export async function transformWithJSONata(data: any, jsonataFilename: string) {
    const expression = jsonata(await readFile(jsonataFilename, 'utf-8'));
    return await expression.evaluate(data);
}
