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
    DomainMap,
    RequestEnvironment,
    TransformTask,
    TransformTaskDef,
    TransformerContext,
} from './types';

@Injectable()
export class TransformTasksRunner {
    async run(context: TransformerContext) {
        context.requestEnv = await this._get_request_env(context);
        context.tasksDefList = await this.get_task_def_list(context);
        for (const transformTaskDef of context.tasksDefList) {
            console.log(`Task - ${transformTaskDef.name || ''}`);
            // console.log('Before-', `${transformTaskDef.name || transformTaskDef.type}`, Object.keys(context));
            if (transformTaskDef.condition) {
                // eslint-disable-next-line no-eval
                if (!!eval(transformTaskDef.condition) === false) {
                    console.log('Skipping step');
                    continue;
                }
            }
            await this._run_transform_task(transformTaskDef, context);
            // console.log('After-', `${transformTaskDef.name || transformTaskDef.type}`, Object.keys(context));
            // console.log(JSON.stringify(context, null, 2));
        }
        console.log(JSON.stringify(context, null, 2));
        // console.log('Done with all tasks');
    }

    async _run_transform_task(transformTaskDef: TransformTaskDef, context: TransformerContext) {
        const transformTask: TransformTask = this.create_task(transformTaskDef);
        transformTask.preCheck(context);
        await transformTask.run(context);
        // console.log(context.graphqlResponse);
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

        const domain: string = context.becknRequest.body.context.domain;
        const action: string = context.becknRequest.body.context.action;

        const domainMap: DomainMap = await readJSON(context.env.domainTransformationsConfigFile);
        const domainConfigFile: string = path.join(transformationsFolder, domainMap[domain].mapFile);
        const domainSupportFilesFolder: string = path.join(
            transformationsFolder,
            domainMap[domain].supportFilesFolder,
        );

        return {
            domain,
            action,
            domainConfigFile,
            domainSupportFilesFolder,
        };
    }

    async get_task_def_list(context: TransformerContext): Promise<TransformTaskDef[]> {
        if (!context.requestEnv) return [];
        const domainConfiguration = await readJSON(context.requestEnv.domainConfigFile);
        const taskDefList = domainConfiguration[context.requestEnv.action];
        return taskDefList;
    }
}
