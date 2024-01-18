/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';
import { readJSON } from 'fs-extra';
import path from 'path';

import { assertUnreachable } from '../common';
import { Environment } from '../types';

import { CreateBecknResponse } from './transform-tasks/create-beckn-response';
import { CreateGraphQLQuery } from './transform-tasks/create-graphql-query';
import { SendGraphQLRequest } from './transform-tasks/send-graphql-request';
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
            await this._run_transform_task(transformTaskDef, context);
        }
    }

    async _run_transform_task(transformTaskDef: TransformTaskDef, context: TransformerContext) {
        const transformTask: TransformTask = this.create_task(transformTaskDef);
        transformTask.preCheck(context);
        await transformTask.run(context);
        // console.log(context.graphqlResponse);
    }

    create_task(transformTaskDef: TransformTaskDef) {
        switch (transformTaskDef.type) {
            case 'create-graphql-query':
                return new CreateGraphQLQuery(transformTaskDef);
            case 'send-graphql-request':
                return new SendGraphQLRequest(transformTaskDef);
            case 'create-beckn-response':
                return new CreateBecknResponse(transformTaskDef);
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
