import { IMetric } from "../metric/IMetric";
import { INamespace } from "./INamespace";
import { IRegistry } from "../registry/IRegistry";
import { ICollectedMetric } from "../ICollectedMetric";

export class Namespace implements INamespace {
    _metrics: Map<string, IMetric> = new Map<string, IMetric>()
    _name: string
    _registry: IRegistry

    constructor(registry: IRegistry, name: string) {
        this._registry = registry;
        this._name = name;

        registry.add(this);
    }

    add(metric: IMetric): void {
        if (this._metrics.has(metric.name)) {
            throw new Error("Metric already exists");
        }
        this._metrics.set(metric.name, metric);
    }

    clear(): void {
        this._metrics.clear();
    }

    collect(): IterableIterator<ICollectedMetric> {
        return (function *(): Generator<ICollectedMetric, void, unknown> {
            for (const [, metric] of this._metrics) {
                yield* metric.collect();
            }
        }.bind(this))();
    }

    get name() {
        return this._name;
    }

    get metrics(): IterableIterator<[string, IMetric]> {
        return this._metrics[Symbol.iterator]();
    }
}
