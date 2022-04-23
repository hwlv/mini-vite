/** @format */

import { build, Loader, transformSync, Plugin } from 'esbuild'
import fs from 'fs'
import type { ImportSpecifier } from 'es-module-lexer'
import { init, parse as parseImports } from 'es-module-lexer'
import chalk from 'chalk'
import resolve from 'resolve'
import path from 'path'
import { transformCode } from './transformJs';
// import {appRoot} from './util.js'
import { cred, appRoot, resolveFrom } from './utils'

// console.log(resolve.sync('react'))

async function exec() {
  // const react = '/Users/hwlv/Desktop/cli/node_modules/react/index.js'
  // const resolveObj = await import(react)
  // console.log(resolveObj)
  const { deps } = await scanImports()

  console.log(cred(deps))
}

// scan import
export async function scanImports() {
  const deps = {}
  const esbuildScanPlugin: Plugin = {
    name: 'dep-scan',
    setup(build) {
      build.onLoad({ filter: /\.(js|ts|tsx)/ }, async (args) => {
        console.log(chalk.green('path:', args.path))
        const source = fs.readFileSync(args.path, 'utf8')
        console.log('内容:', source.split('\n')[0])
        if (args.path.includes('/src')) {
          console.log(chalk.yellow(args.path))
          let ext = path.extname(args.path).slice(1)
          console.log(ext)
          const ret = transformCode({
            code: source,
            loader: ext as Loader
          })

          // parse import
          await init
          let imports: readonly ImportSpecifier[] = []
          try {
            imports = parseImports(ret.code)[0]
          } catch (e: any) {
          }

          // const [imports:ImportSpecifier, exports] = parseImports(
          //   ret.code,
          //   'optional-sourcename'
          // )

          imports.forEach(specifier => {
            const { n: string } = specifier
            console.log(specifier)
            // if (!specifier?.n.includes('/')) {
            // deps[specifier.n] = resolveFrom(specifier.n, appRoot)
            // importedUrls.add(specifier.n)
            // const resolveObj =await import('react')
            // console.log(resolveObj);
            // }
          })
          // console.log(parseImports(contents,'optional-sourcename'))
        }

        return {
          contents: source,
          loader: 'tsx'
        }
      })
    }
  }

  const entryPoints = `${appRoot}/examples/prebuild/src/index.tsx`

  console.log({ entryPoints })

  await build({
    entryPoints: [entryPoints],
    bundle: true,
    // outfile: 'examples/prebuild/cache/index.tsx',
    format: 'esm',
    write: true,
    // metafile: true,
    splitting: true,
    outdir: 'examples/prebuild/cache',

    plugins: [esbuildScanPlugin]
  }).catch(() => process.exit(1))
  // console.log('文件路径: ')
  return { deps }
}



//
export async function optimizeDeps() { }

exec()

// importAnalysisPlugin
