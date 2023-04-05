import fs from 'fs'
import ts from 'typescript'
import readdr from 'fs-readdir-recursive'
import { minify } from 'uglify-js'
import { path_resolve, path_relative, public_path, is_prod, log, mkdir, write, watch } from './util.js'

const js_header_defines = `var __PROD=${is_prod},core={}\n`
const build_js = async () => {
    readdr(path_resolve('ts_outdir')).forEach(name => {
        const input = path_resolve('../ts', name.replace(/\.js$/i, '.ts'))
        if (!fs.existsSync(input)) {
            const output = path_resolve('ts_outdir', name)
            fs.unlinkSync(output)
            log(31, '- js:', path_relative(output))
        }
    })

    const comp = []
    const add = p => comp.push(path_resolve('ts_outdir', p))

    fs.readFileSync(path_resolve('../ts/build_list.ts'))
        .toString().split('\n')
        .forEach(p => {
            if (p) {
                p = p.substring(1, p.length - 2)
                add(`${p}.js`)
            }
        })

    let result = js_header_defines
    let count = 0
    comp.forEach(p => {
        if (fs.existsSync(p)) {
            result += fs.readFileSync(p).toString()
            count++
        }
    })

    log(36, 'i js:', `merging ${count} file${count === 1 ? '' : 's'}`)

    const build_path = path_resolve(public_path, 'main.js')
    if (is_prod) {
        fs.writeFileSync(build_path, minify(result).code)
        log(32, '+ js:', path_relative(build_path), '(minified)')
    }
    else {
        fs.writeFileSync(build_path, result)
        log(32, '+ js:', path_relative(build_path))
    }
}

log(36, 'i dev:', `start development${is_prod ? ' (prod)' : ''}`)

log(36, 'i dev:', 'ensuring required path exists')
write(path_resolve(public_path, 'main.js'), '', '+ build:')
mkdir(path_resolve('ts_outdir'), '+ build:')

log(36, 'i dev:', 'start watching')
ts.createWatchProgram(
    ts.createWatchCompilerHost(
        ts.findConfigFile(path_resolve('../'), ts.sys.fileExists, 'tsconfig.json'),
        {},
        ts.sys,
        ts.createSemanticDiagnosticsBuilderProgram,
        diag => console.error('Error', diag.code, ':', ts.flattenDiagnosticMessageText(diag.messageText, ts.sys.newLine)),
        diag => console.info(ts.formatDiagnostic(diag, {
            getCanonicalFileName: path => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine,
        }))
    )
)

log(36, 'i dev:', 'building once')
await build_js()

watch(path_resolve('ts_outdir'), name => /\.js$/i.test(name), async () => {
    await build_js()
})
