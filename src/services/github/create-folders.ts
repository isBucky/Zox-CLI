/* eslint-disable security/detect-non-literal-fs-filename */
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function createFolders(folders: string[]) {
    if (!folders.length) return;

    return await Promise.all(
        folders.map((folder) => mkdir(join(global['currentLocal'], folder), { recursive: true })),
    );
}
