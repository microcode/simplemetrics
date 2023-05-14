import { IMetric } from "../metric/IMetric";
import { ICollectedMetric } from "../ICollectedMetric";

export interface INamespace {
    readonly name: string
    readonly metrics: IterableIterator<[string, IMetric]>

    add(metric: IMetric): void
    clear(): void

    collect(): IterableIterator<ICollectedMetric>
}
