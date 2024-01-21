/* eslint-disable no-console */
import path from 'path';

import { assignValue, checkArgsForKeys } from '../common/transform-utils';
import { transformWithJSONata } from '../common/transform-with-jsonata';
import { TransformTask, TransformTaskDef, TransformerContext } from '../types';

export class TransformAndAdd implements TransformTask {
    constructor(public taskDef: TransformTaskDef) {}
    private outputKey: string;
    private jsonataFilename: string;

    preCheck(context: TransformerContext): boolean {
        if (!this.taskDef.args || !context.requestEnv) throw Error('TransformAndAdd needs to be configured');

        if (!context.requestEnv.domainSupportFilesFolder)
            throw Error('Domain support files folder needs to be configured');
        checkArgsForKeys('TransformAndAdd', this.taskDef.args, ['jsonataFilename', 'outputKey']);

        this.jsonataFilename = path.join(
            context.requestEnv.domainSupportFilesFolder,
            this.taskDef.args.jsonataFilename,
        );
        this.outputKey = this.taskDef.args.outputKey;
        return true;
    }

    async run(context: TransformerContext): Promise<void> {
        const result = await transformWithJSONata(context, this.jsonataFilename);
        assignValue(context, this.outputKey, result);
    }
}
