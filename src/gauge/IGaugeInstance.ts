export interface IGaugeInstance {
    value: number

    inc(): void
    add(amount: number): void
    sub(amount: number): void
}
