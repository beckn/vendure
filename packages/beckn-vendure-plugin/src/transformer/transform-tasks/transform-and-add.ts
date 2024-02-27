/* eslint-disable no-console */
import path from 'path';

import { assignValue, checkArgsForKeys, getFullJSONataFilename } from '../common/transform-utils';
import { transformWithJSONata } from '../common/transform-with-jsonata';
import { TransformTask, TransformTaskDef, TransformerContext } from '../types';

export class TransformAndAdd implements TransformTask {
    constructor(public taskDef: TransformTaskDef) {}
    private outputKey: string;
    private jsonataFilename: string;

    preCheck(context: TransformerContext): boolean {
        if (!this.taskDef.args || !context.requestEnv) throw Error('TransformAndAdd needs to be configured');

        if (!context.requestEnv.versionSupportFilesFolder)
            throw Error('Version support files folder needs to be configured');
        checkArgsForKeys('TransformAndAdd', this.taskDef.args, ['jsonataFilename', 'outputKey']);

        this.jsonataFilename = getFullJSONataFilename(
            context.env.transformationsFolder,
            context.requestEnv.versionSupportFilesFolder,
            this.taskDef.args.jsonataFilename,
            this.taskDef.args.common,
        );
        this.outputKey = this.taskDef.args.outputKey;
        return true;
    }

    async run(context: TransformerContext): Promise<void> {
        const result = await transformWithJSONata(context, this.jsonataFilename);
        // console.log(this.outputKey, result);
        assignValue(context, this.outputKey, result);
    }
}
