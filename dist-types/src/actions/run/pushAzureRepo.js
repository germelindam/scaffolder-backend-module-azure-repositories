/*
 * Copyright 2022 Parfümerie Douglas GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { InputError } from "@backstage/errors";
import { createTemplateAction } from "@backstage/plugin-scaffolder-backend";
import { commitAndPushBranch } from "../helpers";
import { getRepoSourceDirectory } from "../util";
export const pushAzureRepoAction = (options) => {
    const { integrations, config } = options;
    return createTemplateAction({
        id: "azure:repo:push",
        description: "Push the content in the workspace to a remote Azure repository.",
        schema: {
            input: {
                required: [],
                type: "object",
                properties: {
                    branch: {
                        title: "Repository Branch",
                        type: "string",
                        description: "The branch to checkout to.",
                    },
                    sourcePath: {
                        type: "string",
                        title: "Working Subdirectory",
                        description: "The subdirectory of the working directory containing the repository.",
                    },
                    gitCommitMessage: {
                        title: "Git Commit Message",
                        type: "string",
                        description: "Sets the commit message on the repository. The default value is 'Initial commit'",
                    },
                    gitAuthorName: {
                        title: "Default Author Name",
                        type: "string",
                        description: "Sets the default author name for the commit. The default value is 'Scaffolder'.",
                    },
                    gitAuthorEmail: {
                        title: "Default Author Email",
                        type: "string",
                        description: "Sets the default author email for the commit.",
                    },
                    server: {
                        type: "string",
                        title: "Server hostname",
                        description: "The hostname of the Azure DevOps service. Defaults to dev.azure.com",
                    },
                    token: {
                        title: "Authenticatino Token",
                        type: "string",
                        description: "The token to use for authorization.",
                    },
                },
            },
        },
        async handler(ctx) {
            var _a;
            const { branch, gitCommitMessage, gitAuthorName, gitAuthorEmail, server } = ctx.input;
            const sourcePath = getRepoSourceDirectory(ctx.workspacePath, ctx.input.sourcePath);
            const host = server !== null && server !== void 0 ? server : "dev.azure.com";
            const integrationConfigToken = integrations.azure.byHost(host).config.credentials[0].kind;
            if (!integrationConfigToken) {
                throw new InputError(`No matching integration configuration for host ${host}, please check your integrations config`);
            }
            if (!integrationConfigToken && !ctx.input.token) {
                throw new InputError(`No token provided for Azure Integration ${host}`);
            }
            const token = (_a = ctx.input.token) !== null && _a !== void 0 ? _a : integrationConfigToken;
            const gitAuthorInfo = {
                name: gitAuthorName
                    ? gitAuthorName
                    : config.getOptionalString("scaffolder.defaultAuthor.name"),
                email: gitAuthorEmail
                    ? gitAuthorEmail
                    : config.getOptionalString("scaffolder.defaultAuthor.email"),
            };
            await commitAndPushBranch({
                dir: sourcePath,
                auth: { username: "notempty", password: token },
                logger: ctx.logger,
                commitMessage: gitCommitMessage
                    ? gitCommitMessage
                    : config.getOptionalString("scaffolder.defaultCommitMessage") ||
                        "Initial commit",
                gitAuthorInfo,
                branch,
            });
        },
    });
};
