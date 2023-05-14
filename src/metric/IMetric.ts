import { IMetricInstance } from "./IMetricInstance";
import { INamespace } from "../namespace/INamespace";
import { ICollectedMetric } from "../ICollectedMetric";
import { MetricType } from "./MetricType";

export interface IMetric {
    readonly namespace: INamespace
    readonly name: string
    readonly help?: string
    readonly type: MetricType
    readonly constLabels: ReadonlyMap<string, string>
    readonly instances: IterableIterator<[string, IMetricInstance]>

    clear(): void
    collect(): IterableIterator<ICollectedMetric>
}
