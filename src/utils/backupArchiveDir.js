import fs from 'fs-extra';

export default function backupArchiveDir(src) {
  if (fs.existsSync(src)) {
    fs.renameSync(src, src + '_backup_' + Date.now());
  }
}
