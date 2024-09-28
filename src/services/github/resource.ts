// Types
import { configZoxName } from '../../structures/config';
import type { ResourceData } from '../../commands';
import type Github from '.';

export async function resolveResource(git: Github, name: string) {
    const content = await git.getContent('resources', name);
    const resourceData = await git.getData(content);

    // Arrays
    const files = content.filter((file) => file.type == 'blob' && file.path !== configZoxName);
    const folders = (<string[]>[]).concat(
        content.filter((i) => i.type == 'tree').map((i) => i.path),
        resourceData?.folders || [],
    );
    const dependencies = resourceData.package?.dependencies || [];
    const devDependencies = resourceData.package?.devDependencies || [];

    return {
        downloadSize: files.reduce((a, file) => a + (file?.size || 0), 0),
        folders,
        files,

        data: {
            ...resourceData,

            package: {
                ...resourceData.package,

                dependencies,
                devDependencies,
                scripts: resourceData.package?.scripts || {},
            },

            env: resourceData?.env || {},
        } as ResourceData,
    };
}
