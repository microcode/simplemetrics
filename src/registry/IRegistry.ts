import { INamespace } from "../namespace/INamespace";
import { ICollectedMetric } from "../ICollectedMetric";

export interface IRegistry {
    readonly namespaces: IterableIterator<[string, INamespace]>

    add(namespace: INamespace): void
    clear(): void

    collect(): IterableIterator<ICollectedMetric>
}
