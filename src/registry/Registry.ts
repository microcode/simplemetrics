import { ICollectedMetric } from "../ICollectedMetric";
import { INamespace } from "../namespace/INamespace";
import { IRegistry } from "./IRegistry";

export class Registry implements IRegistry {
    _namespaces: Map<string, INamespace> = new Map<string, INamespace>();

    add(namespace: INamespace) {
        if (this._namespaces.has(namespace.name)) {
            throw new Error("Namespace already exists");
        }

        this._namespaces.set(namespace.name, namespace);
    }

    clear(): void {
        for (const [, ns] of this._namespaces) {
            ns.clear();
        }
        this._namespaces.clear();
    }

    get namespaces(): IterableIterator<[string, INamespace]> {
        return this._namespaces[Symbol.iterator]();
    }

    collect(): IterableIterator<ICollectedMetric> {
        return (function* (): Generator<ICollectedMetric, void, unknown> {
            for (const [, namespace] of this._namespaces) {
                yield* namespace.collect();
            }
        }.bind(this))();
    }
}
