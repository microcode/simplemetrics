export interface ICounterInstance {
    readonly value: number

    inc(): void
    add(amount: number): void
}
