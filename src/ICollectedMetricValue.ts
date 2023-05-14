export interface ICollectedMetricValue {
    suffix?: string
    labels: ReadonlyMap<string, string>
    value: number,
    timestamp?: number
}