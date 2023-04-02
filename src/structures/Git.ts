import { Octokit } from 'octokit';

export default class Git extends Octokit {
    public authenticated: boolean;
    public name: string;

    constructor() {
        super({ auth: process.env.GIT_AUTH });
        if (!process.env.GIT_AUTH) throw new Error('Authentication is required');

        this.authenticated = false;
        this.name = '';
    }

    async createRepository(options: RepositoryCreateOptions) {
        if (!this.authenticated) throw new Error('Authentication is required');
        try {
            return await this.request('POST /user/repos', {
                homepage: 'https://github.com/',
                ...options
            });
        } catch(error) {
            throw new Error('Repository creation failed: ' + error);
        }
    }

    async authenticate() {
        try {
            const { data: { login } } = await this.rest.users.getAuthenticated();

            this.authenticated = true;
            this.name = login;
            return login;
        } catch(error) {
            throw new Error('Authentication failed' + error);
        }
    }
}

interface RepositoryCreateOptions {
    name: string;
    description?: string;
    private?: boolean;
}