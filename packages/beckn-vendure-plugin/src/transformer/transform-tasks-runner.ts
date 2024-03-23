/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';
import { readJSON } from 'fs-extra';
import path from 'path';

import { assertUnreachable } from '../common';
import { Environment } from '../types';

import { SendGraphQLRequest } from './transform-tasks/send-graphql-request';
import { SendMultipleGraphQLRequests } from './transform-tasks/send-multiple-graphql-requests';
import { TransformAndAdd } from './transform-tasks/transform-and-add';
import {
    BecknRequest,
    VersionMap,
    RequestEnvironment,
    TransformTask,
    TransformTaskDef,
    TransformerContext,
    BecknResponse,
} from './types';
import { TROUBLESHOOTING_MODE } from '../constants';

@Injectable()
export class TransformTasksRunner {
    async run(context: TransformerContext) {
        try {
            const overallTaskStartTS = new Date().getTime();
            context.requestEnv = await this._get_request_env(context);
            context.tasksDefList = await this.get_task_def_list(context);
            for (const transformTaskDef of context.tasksDefList) {
                // const startTS = new Date().getTime();
                // console.log(`Task - ${transformTaskDef.name || ''}`);
                // console.log(JSON.stringify(context, null, 2));
                if (transformTaskDef.condition) {
                    // eslint-disable-next-line no-eval
                    if (!!eval(transformTaskDef.condition) === false) {
                        // console.log('Skipping step');
                        continue;
                    }
                }
                await this._run_transform_task(transformTaskDef, context);
                // console.log(`Task - ${transformTaskDef.name || ''}. Took - ${new Date().getTime() - startTS} ms`);
            }
            if (TROUBLESHOOTING_MODE) console.log(JSON.stringify(context, null, 2));
            // console.log(`Task took a total of ${new Date().getTime() - overallTaskStartTS} ms`);
        } catch (error: any) {
            console.log(error);
            if (TROUBLESHOOTING_MODE) console.log(JSON.stringify(context, null, 2));
            context.becknResponse = this._formBecknErrorResponse(
                context,
                error.message || 'Internal Error without message occurred',
            );
        }
    }

    async _run_transform_task(transformTaskDef: TransformTaskDef, context: TransformerContext) {
        const transformTask: TransformTask = this.create_task(transformTaskDef);
        transformTask.preCheck(context);
        await transformTask.run(context);
    }

    create_task(transformTaskDef: TransformTaskDef) {
        switch (transformTaskDef.type) {
            case 'transform-and-add':
                return new TransformAndAdd(transformTaskDef);
            case 'send-graphql-request':
                return new SendGraphQLRequest(transformTaskDef);
            case 'send-multiple-graphql-requests':
                return new SendMultipleGraphQLRequests(transformTaskDef);
            default:
                const message = `Non existant task type "${
                    transformTaskDef.type as string
                }" specified in transformations json file`;
                return assertUnreachable(transformTaskDef.type, message);
        }
    }

    async _get_request_env(context: TransformerContext): Promise<RequestEnvironment> {
        const transformationsFolder = context.env.transformationsFolder;

        // const version: string = context.becknRequest.body.context.version;
        const version: string = '1.1.0'; // Right now we support only 1.1.0
        const action: string = context.becknRequest.body.context.action;

        const versionMap: VersionMap = await readJSON(context.env.versionTransformationsConfigFile);
        const versionDetails = this._get_version_details(versionMap, version);
        const versionConfigFile: string = path.join(transformationsFolder, versionDetails.mapFile);
        const versionSupportFilesFolder: string = path.join(
            transformationsFolder,
            versionDetails.supportFilesFolder,
        );

        return {
            version,
            action,
            versionConfigFile: versionConfigFile,
            versionSupportFilesFolder: versionSupportFilesFolder,
        };
    }

    _get_version_details(versionMap: VersionMap, version: string) {
        if (version in Object.keys(versionMap)) {
            return versionMap[version];
        } else return versionMap['1.1.0'];
    }

    async get_task_def_list(context: TransformerContext): Promise<TransformTaskDef[]> {
        if (!context.requestEnv) return [];
        const versionConfiguration = await readJSON(context.requestEnv.versionConfigFile);
        const taskDefList = versionConfiguration[context.requestEnv.action];
        return taskDefList;
    }

    _formBecknErrorResponse(context: TransformerContext, errorMessage: string): BecknResponse {
        return {
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                context: context.becknResponseContext,
                error: {
                    code: '30000',
                    message: errorMessage,
                },
            },
        };
    }
}
