/*
 * @Author: hongwang.lv
 * @Date: 2021-10-06 09:02:14
 * @Description: 
 */
import { existsSync } from 'fs';
import { dirname, extname, join } from 'path';
import { transformSync } from 'esbuild';
import chalk from 'chalk';

export function transformCode(opts) {
    return transformSync(opts.code, {
        loader: opts.loader || 'ts',
        sourcemap: true,
        format: 'esm',
    });
}

export function transformJS(opts) {
    const ext = extname(opts.path).slice(1);
    console.log({ ext });
    const ret = transformCode({
        code: opts.code,
        loader: ext,
    });

    let { code } = ret;
    code = code.replace(
        /\bimport(?!\s+type)(?:[\w*{}\n\r\t, ]+from\s*)?\s*("([^"]+)"|('[^']+'))/gm,
        (a, b, c) => {
            console.log(chalk.yellowBright('reg............'));
            console.log(a);
            console.log(b);
            console.log(c);

            // handle node_modules lib css 
            if (!c.startsWith('.') && !c.startsWith('@') && !c.startsWith('/') && c.endsWith('.css')) {
                return a.replace(/"/, `"/node_modules/`)
            }
            let from;
            console.log({ 'c.charAt(0)': c.charAt(0) });
            if (c.charAt(0) === '.' || c.startsWith('@/')) {
                // 处理别名
                if (c.charAt(0) === '@') {
                    c = c.replace(/@\//, '/src/')
                    from = c
                } else {
                    from = join(dirname(opts.path), c);
                }
                console.log(chalk.blueBright('from ..............3'));
                console.log(opts.path);
                console.log(dirname(opts.path));
                console.log(from);

                const filePath = join(opts.appRoot, from);
                if (!existsSync(filePath)) {
                    if (existsSync(`${filePath}.tsx`)) {
                        from = `${from}.tsx`;
                    } else if (existsSync(`${filePath}.ts`)) {
                        from = `${from}.ts`;
                    }
                }

                if (['svg'].includes(extname(from).slice(1))) {
                    from = `${from}?import`;
                }
            } else {
                from = `/node_modules/.cache/${c}.js`;
            }

            return a.replace(b, `"${from}"`);
        },
    );

    return {
        ...ret,
        code,
    };
}