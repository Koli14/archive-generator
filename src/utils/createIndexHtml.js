import fs from 'fs-extra';
import path from 'path';
import { readdir } from 'node:fs/promises';
import { formatBytes, createContent } from './index.js';

export default async function createIndexHtml(projectTitle, archiveDir, archiveContentDir) {
  let indexTemplate = fs.readFileSync('templates/index.html', 'utf8');
  const folderTemplate = fs.readFileSync('templates/treeView/folder.html', 'utf8');
  const fileTemplate = fs.readFileSync('templates/treeView/file.html', 'utf8');

  async function createRecurcsiveTreeItem(dir, parent = '${childs}') {
    try {
      const fileNodes = await (
        await readdir(dir)
      )
        .map((item) => {
          const filePath = path.resolve(dir, item).replaceAll(path.sep, '/');
          const stat = fs.lstatSync(filePath);
          return {
            name: item,
            path: filePath,
            isDir: stat.isDirectory(),
            birthtime: stat.birthtime.toLocaleString(),
            mtime: stat.mtime.toLocaleString(),
            size: formatBytes(stat.size),
          };
        })
        .sort((a, b) => b.isDir - a.isDir || a.name - b.name);

      const relativePath = './' + path.relative(archiveDir, dir).replaceAll(path.sep, '/') + '/';
      let childs = '';
      for (const fileNode of fileNodes) {
        if (fileNode.isDir) {
          childs += folderTemplate.replace('${name}', fileNode.name).replace('${href}', relativePath + fileNode.name);
          childs = await createRecurcsiveTreeItem(fileNode.path, childs);
        } else {
          childs += fileTemplate.replace('${name}', fileNode.name).replace('${href}', relativePath + fileNode.name);
        }
      }
      createContent(archiveDir, archiveContentDir, dir, fileNodes);

      return parent.replace('${childs}', childs);
    } catch (err) {
      console.error(err);
    }
  }

  const treeHtml = await createRecurcsiveTreeItem(archiveContentDir);

  indexTemplate = indexTemplate.replace('${treeView}', treeHtml).replace('${projectTitle}', projectTitle);
  fs.writeFileSync(`${archiveDir}/index.html`, indexTemplate);
}
