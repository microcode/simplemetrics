export type TimedFunction<T> = () => Promise<T>

export interface ISummaryInstance {
    readonly count: number
    readonly sum: number

    observe(value: number): void
    time<T>(fn: TimedFunction<T>): Promise<T>;
}