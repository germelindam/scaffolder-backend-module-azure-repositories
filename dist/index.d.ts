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

declare const cloneAzureRepoAction = (options) => {
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

declare const pushAzureRepoAction = (options) => {
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

/**
 * Creates an `ado:repo:pr` Scaffolder action.
 *
 * @remarks
 *
 * This Scaffolder action will create a PR to a repository in Azure DevOps.
 *
 * @public
 */
declare const pullRequestAzureRepoAction = (options) => {
    const { integrations } = options;
    return createTemplateAction({
        id: 'azure:repo:pr',
        description: 'Create a PR to a repository in Azure DevOps.',
        schema: {
            input: {
                type: 'object',
                required: ['repoId', 'title'],
                properties: {
                    organization: {
                        title: 'Organization Name',
                        type: 'string',
                        description: 'The name of the organization in Azure DevOps.',
                    },
                    sourceBranch: {
                        title: 'Source Branch',
                        type: 'string',
                        description: 'The branch to merge into the source.',
                    },
                    targetBranch: {
                        title: 'Target Branch',
                        type: 'string',
                        description: "The branch to merge into (default: main).",
                    },
                    title: {
                        title: 'Title',
                        description: 'The title of the pull request.',
                        type: 'string',
                    },
                    repoId: {
                        title: 'Remote Repo ID',
                        description: 'Repo ID of the pull request.',
                        type: 'string',
                    },
                    project: {
                        title: 'ADO Project',
                        description: 'The Project in Azure DevOps.',
                        type: 'string',
                    },
                    supportsIterations: {
                        title: 'Supports Iterations',
                        description: 'Whether or not the PR supports interations.',
                        type: 'boolean',
                    },
                    server: {
                        type: "string",
                        title: "Server hostname",
                        description: "The hostname of the Azure DevOps service. Defaults to dev.azure.com",
                    },
                    token: {
                        title: 'Authenticatino Token',
                        type: 'string',
                        description: 'The token to use for authorization.',
                    },
                }
            }
        },
        async handler(ctx) {
            var _a, _b, _c, _d;
            const { title, repoId, server, project, supportsIterations } = ctx.input;
            const sourceBranch = (_a = `refs/heads/${ctx.input.sourceBranch}`) !== null && _a !== void 0 ? _a : `refs/heads/scaffolder`;
            const targetBranch = (_b = `refs/heads/${ctx.input.targetBranch}`) !== null && _b !== void 0 ? _b : `refs/heads/main`;
            const host = server !== null && server !== void 0 ? server : "dev.azure.com";
            const integrationConfigToken = integrations.azure.byHost(host).config.credentials[0].kind;
            if (!integrationConfigToken) {
                throw new InputError(`No matching integration configuration for host ${host}, please check your integrations config`);
            }
            if (!integrationConfigToken && !ctx.input.token) {
                throw new InputError(`No token provided for Azure Integration ${host}`);
            }
            const pullRequest = {
                sourceRefName: sourceBranch,
                targetRefName: targetBranch,
                title: title,
            };
            const org = (_c = ctx.input.organization) !== null && _c !== void 0 ? _c : 'notempty';
            const token = (_d = ctx.input.token) !== null && _d !== void 0 ? _d : integrationConfigToken;
            await createADOPullRequest({
                gitPullRequestToCreate: pullRequest,
                server: server,
                auth: { org: org, token: token },
                repoId: repoId,
                project: project,
                supportsIterations: supportsIterations,
            });
        },
    });
};

export { cloneAzureRepoAction, pullRequestAzureRepoAction, pushAzureRepoAction };
