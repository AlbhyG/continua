import path from 'node:path'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import qpdf from '@jspawn/qpdf-wasm'

let modulePromise: ReturnType<typeof qpdf> | null = null
type QpdfOptions = Parameters<typeof qpdf>[0] & {
  instantiateWasm?: (
    imports: WebAssembly.Imports,
    receiveInstance: (instance: WebAssembly.Instance) => void
  ) => WebAssembly.Exports
}

function getWasmPath() {
  const require = createRequire(import.meta.url)
  return path.join(
    path.dirname(require.resolve('@jspawn/qpdf-wasm/package.json')),
    'qpdf.wasm'
  )
}

async function getQpdfModule() {
  if (!modulePromise) {
    const originalFetch = globalThis.fetch
    try {
      // qpdf-wasm's Node loader prefers fetch when it exists, but Node fetch
      // cannot load the package's local wasm path. Force the filesystem path.
      delete (globalThis as { fetch?: typeof fetch }).fetch
      const qpdfOptions: QpdfOptions = {
        noInitialRun: true,
        locateFile: (file) => (file.endsWith('.wasm') ? getWasmPath() : file),
        instantiateWasm: (imports, receiveInstance) => {
          const wasmModule = new WebAssembly.Module(readFileSync(getWasmPath()))
          const instance = new WebAssembly.Instance(wasmModule, imports)
          receiveInstance(instance)
          return instance.exports
        },
      }
      modulePromise = qpdf(qpdfOptions)
    } finally {
      globalThis.fetch = originalFetch
    }
  }

  return modulePromise
}

export async function encryptPdf({
  input,
  userPassword,
  ownerPassword,
}: {
  input: Uint8Array
  userPassword: string
  ownerPassword: string
}) {
  const mod = await getQpdfModule()
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const inputPath = `/input-${id}.pdf`
  const outputPath = `/output-${id}.pdf`

  mod.FS.writeFile(inputPath, input)

  try {
    mod.callMain([
      '--encrypt',
      userPassword,
      ownerPassword,
      '256',
      '--print=full',
      '--modify=none',
      '--extract=n',
      '--',
      inputPath,
      outputPath,
    ])
    if (process.exitCode === 3) {
      process.exitCode = 0
    }
  } catch (error) {
    if (!(error instanceof Error) && typeof error === 'object' && error) {
      const status = (error as { status?: number }).status
      if (status === 0 || status === 3) {
        if (status === 3) {
          process.exitCode = 0
        }
      } else {
        throw error
      }
    } else {
      throw error
    }
  } finally {
    try {
      mod.FS.unlink(inputPath)
    } catch {}
  }

  const output = mod.FS.readFile(outputPath)
  try {
    mod.FS.unlink(outputPath)
  } catch {}
  return output
}
