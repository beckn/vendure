/* eslint-disable no-console */
import assert from 'assert';
import { readFile } from 'fs/promises';
import path from 'path';

import { transformWithJSONata } from '../common/transform-with-jsonata';
import { TransformTask, TransformTaskDef, TransformerContext } from '../types';

export class CreateGraphQLQuery implements TransformTask {
    constructor(public taskDef: TransformTaskDef) {}
    private inputKey: string;
    private outputKey: string;
    private graphqlFilename: string;
    private jsonataFilename: string;
    private jsonataHeaderFilename: string;

    preCheck(context: TransformerContext): boolean {
        if (!this.taskDef.args || !context.requestEnv) throw Error('CreateGraphQuery needs to be configured');
        if (!context.requestEnv.domainSupportFilesFolder)
            throw Error('Domain support files folder needs to be configured');
        if (!this.taskDef.args.graphqlFilename)
            throw Error('CreateGraphQLQuery requires a graphqlFilename config parameter');
        if (!this.taskDef.args.jsonataFilename)
            throw Error('CreateGraphQLQuery requires a jsonataFilename config parameter');

        this.graphqlFilename = path.join(
            context.requestEnv.domainSupportFilesFolder,
            this.taskDef.args.graphqlFilename,
        );
        this.jsonataFilename = path.join(
            context.requestEnv.domainSupportFilesFolder,
            this.taskDef.args.jsonataFilename,
        );
        if (this.taskDef.args.jsonataHeaderFilename) {
            this.jsonataHeaderFilename = path.join(
                context.requestEnv.domainSupportFilesFolder,
                this.taskDef.args.jsonataFilename,
            );
        }
        this.inputKey = this.taskDef.args.input || 'becknRequest';
        this.outputKey = this.taskDef.args.output || 'graphqlRequest';
        return true;
    }

    async run(context: TransformerContext): Promise<void> {
        const item_to_search: string = context[this.inputKey]?.body?.message?.intent?.item?.descriptor?.name;

        const query = await readFile(this.graphqlFilename, 'utf-8');
        const variables = await transformWithJSONata(context, this.jsonataFilename);
        let headers = {};
        if (this.jsonataHeaderFilename)
            headers = await transformWithJSONata(context, this.jsonataHeaderFilename);
        context[this.outputKey] = {
            headers: { 'content-type': 'application/json', ...headers },
            query,
            variables,
        };
    }
}
