/* eslint-disable security/detect-non-literal-fs-filename */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Types
import type { GetContentResult } from '.';
import type Github from '.';

export async function copyFilesFromGithub(git: Github, files: GetContentResult['tree']) {
    const unresolvedPromiseOfWriting: Promise<any>[] = [];

    await Promise.all(
        files.map(async (file) => {
            const request = await git.instance.get(`git/blobs/${file.sha}`);
            if (file.path == 'data.json') return;

            unresolvedPromiseOfWriting.push(
                writeFile(join(global['currentLocal'], file.path), request.data.content, {
                    encoding: 'base64',
                }),
            );
        }),
    );

    const filesDownloaded = await Promise.all(unresolvedPromiseOfWriting);
    const downloadSize = files.reduce((p, c) => p + c.size!, 0);

    return {
        downloadSize,
        filesDownloaded: filesDownloaded.length,
        files: files.map((file) => file.path),
    };
}
