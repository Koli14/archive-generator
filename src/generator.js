import path from 'path';
import { copyFolders, createIndexHtml, backupArchiveDir } from './utils/index.js';

export default function generator(args) {
  let [srcArchiveDir, archiveDir] = args;
  srcArchiveDir = path.resolve(srcArchiveDir);
  archiveDir = path.resolve(archiveDir).replaceAll(path.sep, '/');
  const projectTitle = path.basename(srcArchiveDir);
  const archiveContentDir = archiveDir + '/' + projectTitle;
  const assetsDir = './assets';
  const archiveAssetsDir = archiveDir + '/assets';

  backupArchiveDir(archiveDir);
  copyFolders(srcArchiveDir, archiveContentDir);
  copyFolders(assetsDir, archiveAssetsDir);

  createIndexHtml(projectTitle, archiveDir, archiveContentDir);
}
