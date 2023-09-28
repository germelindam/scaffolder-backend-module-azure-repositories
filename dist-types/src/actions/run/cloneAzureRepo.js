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
import { resolveSafeChildPath } from "@backstage/backend-common";
import { InputError } from "@backstage/errors";
import { createTemplateAction } from "@backstage/plugin-scaffolder-node";
import { cloneRepo } from "../helpers";
export const cloneAzureRepoAction = (options) => {
    const { integrations } = options;
    return createTemplateAction({
        id: "azure:repo:clone",
        description: "Clone an Azure repository into the workspace directory.",
        schema: {
            input: {
                required: ["repoUrl", "remoteUrl"],
                type: "object",
                properties: {
                    remoteUrl: {
                        title: "Remote URL",
                        type: "string",
                        description: "The Git URL to the repository.",
                    },
                    branch: {
                        title: "Repository Branch",
                        type: "string",
                        description: "The branch to checkout to.",
                    },
                    targetPath: {
                        title: "Working Subdirectory",
                        type: "string",
                        description: "The subdirectory of the working directory to clone the repository into.",
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
            var _a, _b;
            const { remoteUrl, branch, server } = ctx.input;
            const targetPath = (_a = ctx.input.targetPath) !== null && _a !== void 0 ? _a : "./";
            const outputDir = resolveSafeChildPath(ctx.workspacePath, targetPath);
            const host = server !== null && server !== void 0 ? server : "dev.azure.com";
            const integrationConfigToken = integrations.azure.byHost(host).config.credentials[0].kind;
            if (!integrationConfigToken) {
                throw new InputError(`No matching integration configuration for host ${host}, please check your integrations config`);
            }
            if (!integrationConfigToken && !ctx.input.token) {
                throw new InputError(`No token provided for Azure Integration ${host}`);
            }
            const token = (_b = ctx.input.token) !== null && _b !== void 0 ? _b : integrationConfigToken;
            await cloneRepo({
                dir: outputDir,
                auth: { username: "notempty", password: token },
                logger: ctx.logger,
                remoteUrl: remoteUrl,
                branch: branch,
            });
        },
    });
};
