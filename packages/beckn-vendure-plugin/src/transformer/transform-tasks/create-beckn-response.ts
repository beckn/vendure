/* eslint-disable no-console */
import path from 'path';

import { transformWithJSONata } from '../common/transform-with-jsonata';
import { TransformTask, TransformTaskDef, TransformerContext } from '../types';

export class CreateBecknResponse implements TransformTask {
    constructor(public taskDef: TransformTaskDef) {}
    private inputKey: string;
    private outputKey: string;
    private jsonataFilename: string;
    private jsonataHeaderFilename: string;

    preCheck(context: TransformerContext): boolean {
        if (!this.taskDef.args || !context.requestEnv)
            throw Error('CreateBecknResponse needs to be configured');
        if (!context.requestEnv.domainSupportFilesFolder)
            throw Error('Domain support files folder needs to be configured');

        if (!this.taskDef.args.jsonataFilename)
            throw Error('CreateBecknResponse requires a jsonataFilename config parameter');

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
        this.inputKey = this.taskDef.args?.input || 'graphqlResponse';
        this.outputKey = this.taskDef.args?.output || 'becknResponse';
        return true;
    }

    async run(context: TransformerContext): Promise<void> {
        const body = await transformWithJSONata(context, this.jsonataFilename);
        let headers = {};
        if (this.jsonataHeaderFilename)
            headers = await transformWithJSONata(context, this.jsonataHeaderFilename);

        headers = {
            'content-type': 'application/json',
            ...headers,
        };
        context[this.outputKey] = {
            headers,
            body,
        };
    }
}
