
import fs from 'fs';
import path, { extname } from 'path';

// 项目根路径
export const appRoot = process.cwd()

export const joinPath = (...paths: string[]) => {
  return path.resolve(appRoot, ...paths)
}

export const readFile = (path: string) => {
  return fs.readFileSync(path, "utf-8");
}

export const emptyDir = (dir: string) => {
 return fs.rmSync(dir, { recursive: true, force: true })
}

export const cacheDir = path.resolve(appRoot, 'node_modules', '.cache');

