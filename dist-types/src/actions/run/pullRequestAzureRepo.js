import { createTemplateAction } from "@backstage/plugin-scaffolder-backend";
import { InputError } from "@backstage/errors";
import { createADOPullRequest } from "../helpers";
/**
 * Creates an `ado:repo:pr` Scaffolder action.
 *
 * @remarks
 *
 * This Scaffolder action will create a PR to a repository in Azure DevOps.
 *
 * @public
 */
export const pullRequestAzureRepoAction = (options) => {
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
            const credentials = integrations.azure.byHost(host).config.credentials;
            const hasCredentials = credentials.length > 0;
            if (!hasCredentials) {
                throw new InputError(`No matching integration configuration for host ${host}, please check your integrations config`);
            }
            const credentialType = credentials[0].kind;
            const isPATType = credentialType === 'PersonalAccessToken';
            const credentialKind = isPATType ? credentialType.split('').map((v, i) => (i === 0 ? v.toLowerCase() : v)).join('') : credentialType;
            const configToken = isPATType ? credentials[0][credentialKind] : credentials[0];
            if (!configToken && !ctx.input.token) {
                throw new InputError(`No token provided for Azure Integration ${host}`);
            }
            const pullRequest = {
                sourceRefName: sourceBranch,
                targetRefName: targetBranch,
                title: title,
            };
            const org = (_c = ctx.input.organization) !== null && _c !== void 0 ? _c : 'notempty';
            const token = (_d = ctx.input.token) !== null && _d !== void 0 ? _d : configToken;
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
