declare module "@ffmpeg/ffmpeg" {
    export class FFmpeg {
        load(options?: { coreURL?: string; wasmURL?: string }): Promise<void>;
        exec(args: string[]): Promise<void>;
        writeFile(path: string, data: Uint8Array | ArrayBuffer | Blob | File): Promise<void>;
        readFile(path: string): Promise<Uint8Array>;
    }
}

declare module "@ffmpeg/util" {
    export function fetchFile(
        input: string | URL | File | Blob | ArrayBuffer | Uint8Array
    ): Promise<Uint8Array>;
}
