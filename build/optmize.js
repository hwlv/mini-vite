/**
 * @format
 * @Author: hongwang.lv
 * @Date: 2021-10-06 15:42:31
 * @Description:
 */

import fs from 'fs'
import {extname} from 'path'
import chalk from 'chalk'
import {build} from 'esbuild'
import resolve from 'resolve'
import {appRoot, cacheDir} from './utils.js'

export async function optmize({pkgs}) {
  const deps = pkgs.reduce((memo, pkg) => {
    memo[pkg] = resolve.sync(pkg, {
      basedir: appRoot
    })
    return memo
  }, {})
  console.log('deps......................................')
  console.log(deps)
  // fs.rmSync(cacheDir, { recursive: true })

  await build({
    entryPoints: pkgs,
    logLevel: 'error',
    splitting: true,
    sourcemap: true,
    format: 'esm',
    bundle: true,
    write: true,
    metafile: true,
    outdir: cacheDir,
    plugins: [esbuildDepPlugin(deps)]
    // tsconfig: './tsconfig.json',
  })
}

const esbuildDepPlugin = deps => {
  return {
    name: 'dep-pre-bundle',
    setup(build) {
      build.onResolve(
        {filter: /^[\w@][^:]/},
        async ({path: id, importer, kind, resolveDir}) => {
          const isEntry = !importer
          if (id in deps) {
            return isEntry ? {path: id, namespace: 'dep'} : {path: deps[id]}
          } else {
            return {}
          }
        }
      )

      // @ts-ignore
      build.onLoad({filter: /.*/g, namespace: 'dep'}, async ({path: id}) => {
        let contents = ''

        let loader = extname(deps[id]).slice(1)
        if (loader === 'mjs') {
          loader = 'js'
        }
        console.log(loader)

        // export default
        contents += `import d from "${deps[id]}";export default d;\n`
        const moduleObj = await import(id)
        const keys = Object.keys(moduleObj)
          .filter(i => i !== '__esModule' && i !== 'default')
          .join(', ')
        contents += `export { ${keys} } from "${deps[id]}"`
        console.log(
          '%c ${deps[id]}',
          'font-size:20px;color:blue;background:yellow;'
        )
        console.log(deps[id])

        return {
          loader,
          contents,
          resolveDir: appRoot
        }
      })
    }
  }
}
