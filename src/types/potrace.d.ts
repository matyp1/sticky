declare module 'potrace' {
  export function trace(
    image: Buffer | string,
    options?: any,
    callback?: (err: Error | null, svg: string) => void
  ): void
  
  export function posterize(
    image: Buffer | string,
    options?: any,
    callback?: (err: Error | null, svg: string) => void
  ): void
}
