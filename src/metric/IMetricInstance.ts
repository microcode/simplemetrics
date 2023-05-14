import { IMetric } from "./IMetric"
import { ICollectedMetricValue } from "../ICollectedMetricValue"

export interface IMetricInstance {
    readonly metric: IMetric
    readonly labels: ReadonlyMap<string, string>
    collect(): IterableIterator<ICollectedMetricValue>
}
