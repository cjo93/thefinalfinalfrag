// React Three Fiber Intrinsic Elements Override
// This allows using arbitrary three.js elements as JSX tags

declare global {
    namespace JSX {
        interface IntrinsicElements {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [elemName: string]: any;
        }
    }
}
