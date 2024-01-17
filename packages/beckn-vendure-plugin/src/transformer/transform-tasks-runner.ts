/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';
import { readJSON } from 'fs-extra';
import path from 'path';

import { assertUnreachable } from '../common';
import { Environment } from '../types';

import { CreateBecknResponse } from './transform-tasks/create-beckn-response';
import { CreateGraphQLQuery } from './transform-tasks/create-graphql-query';
import { SendGraphQLRequest } from './transform-tasks/send-graphql-request';
import { BecknRequest, TransformTask, TransformTaskDef } from './types';

@Injectable()
export class TransformTasksRunner {
    async run(context: any) {
        console.log(`##### Running tasks: `);
        const env: Environment = context.env;
        const beckn_request: BecknRequest = context.beckn_request;

        const transformationsFolder = env.transformationsFolder;
        const configFile: string = env.domainTransformationsConfigFile;
        const domain: string = beckn_request.body.context.domain;
        const action: string = beckn_request.body.context.action;

        const tasksDefList = await this.read_task_configuration(
            transformationsFolder,
            configFile,
            domain,
            action,
        );

        context.tasksDefList = tasksDefList;

        for (const transformTaskDef of tasksDefList) {
            await this._run_transform_task(transformTaskDef, context);
        }
    }

    async read_task_configuration(
        transformationsFolder: string,
        domainMapFile: string,
        domain: string,
        action: string,
    ): Promise<TransformTaskDef[]> {
        console.log(`read_task_configuration - ${domain} - ${action}`);
        const domainMap = await readJSON(domainMapFile);
        const domainConfigFile = domainMap[domain];
        const domainConfiguration = await readJSON(path.join(transformationsFolder, domainConfigFile));
        const taskDefList = domainConfiguration[action];
        return taskDefList;
    }

    async _run_transform_task(transformTaskDef: TransformTaskDef, context: any) {
        const transformTask: TransformTask = this.create_task(transformTaskDef);
        await transformTask.preCheck(context);
        await transformTask.run(context);
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
}
