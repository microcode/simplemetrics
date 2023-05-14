import { ICollectedMetricValue } from "./ICollectedMetricValue"
import { MetricType } from "./metric/MetricType"

export interface ICollectedMetric {
    namespace: string
    type: MetricType
    name: string
    help?: string
    labels: ReadonlyMap<string, string>
    values: IterableIterator<ICollectedMetricValue>
}