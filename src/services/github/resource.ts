// Types
import type { ResourceData } from '../../commands';
import type Github from '.';

export async function resolveResource(git: Github, name: string) {
    const content = await git.getContent('resources', name);
    const resourceData = await git.getData(content);
    const scripts = resourceData.package?.scripts || {};

    // Arrays
    const files = content.filter((file) => file.type == 'blob' && file.path !== 'data.json');
    const folders = (<string[]>[]).concat(
        content.filter((i) => i.type == 'tree').map((i) => i.path),
        resourceData?.folders || [],
    );
    const dependencies = resourceData.package?.dependencies || [];
    const devDependencies = resourceData.package?.devDependencies || [];

    // Metrics
    const downloadSize = files.reduce((a, file) => a + (file?.size || 0), 0);
    const filesDownloaded = files.length;

    return {
        downloadSize,
        folders,
        files,

        data: {
            ...resourceData,

            package: {
                ...resourceData.package,

                dependencies,
                devDependencies,
                scripts,
            },
        } satisfies ResourceData,
    };
}
