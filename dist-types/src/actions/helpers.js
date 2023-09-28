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
import { Git } from "@backstage/backend-common";
import * as azdev from "azure-devops-node-api";
export async function cloneRepo({ dir, auth, logger, remote = "origin", remoteUrl, branch = "main", }) {
    const git = Git.fromAuth({
        ...auth,
        logger,
    });
    await git.clone({
        url: remoteUrl,
        dir,
    });
    await git.addRemote({
        dir,
        remote,
        url: remoteUrl,
    });
    await git.checkout({
        dir,
        ref: branch,
    });
}
export async function commitAndPushBranch({ dir, auth, logger, remote = "origin", commitMessage, gitAuthorInfo, branch = "scaffolder", }) {
    var _a, _b;
    const authorInfo = {
        name: (_a = gitAuthorInfo === null || gitAuthorInfo === void 0 ? void 0 : gitAuthorInfo.name) !== null && _a !== void 0 ? _a : "Scaffolder",
        email: (_b = gitAuthorInfo === null || gitAuthorInfo === void 0 ? void 0 : gitAuthorInfo.email) !== null && _b !== void 0 ? _b : "scaffolder@backstage.io",
    };
    const git = Git.fromAuth({
        ...auth,
        logger,
    });
    const currentBranch = await git.currentBranch({ dir });
    if (currentBranch !== branch) {
        await git.branch({
            dir,
            ref: branch,
        });
        await git.checkout({
            dir,
            ref: branch,
        });
    }
    await git.add({
        dir,
        filepath: ".",
    });
    await git.commit({
        dir,
        message: commitMessage,
        author: authorInfo,
        committer: authorInfo,
    });
    await git.push({
        dir,
        remote: remote,
        remoteRef: `refs/heads/${branch}`,
    });
}
export async function createADOPullRequest({ gitPullRequestToCreate, server, auth, repoId, project, supportsIterations, }) {
    const url = `https://${server}/`;
    const orgUrl = url + auth.org;
    const token = auth.token || ""; // process.env.AZURE_TOKEN || "";
    const authHandler = azdev.getPersonalAccessTokenHandler(token);
    const connection = new azdev.WebApi(orgUrl, authHandler);
    const gitApiObject = await connection.getGitApi();
    await gitApiObject.createPullRequest(gitPullRequestToCreate, repoId, project, supportsIterations);
}
