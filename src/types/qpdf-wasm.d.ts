declare module '@jspawn/qpdf-wasm' {
  type QpdfModule = {
    FS: {
      writeFile(path: string, data: Uint8Array): void
      readFile(path: string): Uint8Array
      unlink(path: string): void
    }
    callMain(args: string[]): void
  }

  export default function qpdf(options?: {
    noInitialRun?: boolean
    locateFile?: (file: string) => string
  }): Promise<QpdfModule>
}
