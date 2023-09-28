import { Logger } from "winston";
import * as GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces";
export declare function cloneRepo({ dir, auth, logger, remote, remoteUrl, branch, }: {
    dir: string;
    auth: {
        username: string;
        password: string;
    } | {
        token: string;
    };
    logger: Logger;
    remote?: string;
    remoteUrl: string;
    branch?: string;
}): Promise<void>;
export declare function commitAndPushBranch({ dir, auth, logger, remote, commitMessage, gitAuthorInfo, branch, }: {
    dir: string;
    auth: {
        username: string;
        password: string;
    } | {
        token: string;
    };
    logger: Logger;
    remote?: string;
    commitMessage: string;
    gitAuthorInfo?: {
        name?: string;
        email?: string;
    };
    branch?: string;
}): Promise<void>;
export declare function createADOPullRequest({ gitPullRequestToCreate, server, auth, repoId, project, supportsIterations, }: {
    gitPullRequestToCreate: GitInterfaces.GitPullRequest;
    server: string;
    auth: {
        org: string;
        token: string;
    };
    repoId: string;
    project?: string;
    supportsIterations?: boolean;
}): Promise<void>;
