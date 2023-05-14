import { IMetricInstance } from "./IMetricInstance";
import { IMetric } from "./IMetric";
import { IMetricOpts } from "./IMetricOpts";
import { MetricType } from "./MetricType";
import { IMetricLabels } from "./IMetricLabels";

export abstract class Metric<T extends IMetricInstance, Labels extends IMetricLabels, Opts extends IMetricOpts = IMetricOpts> implements IMetric {
    _opts: Opts
    _instances: Map<string, T> = new Map<string, T>()
    abstract _type: MetricType

    constructor(opts: Opts) {
        this._opts = opts;
        opts.namespace.add(this);
    }

    get namespace() {
        return this._opts.namespace;
    }

    get name() {
        return this._opts.name;
    }

    get help() {
        return this._opts.help;
    }

    get type() {
        return this._type;
    }

    get constLabels() {
        return this._opts.constLabels;
    }

    get instances() {
        return this._instances[Symbol.iterator]();
    }

    clear() {
        this._instances.clear();
    }

    collect() {
        return (function* () {
            yield {
                namespace: this._opts.namespace.name,
                type: this._type,
                name: this._opts.name,
                help: this._opts.help,
                labels: this._opts.constLabels,
                values: (function* () {
                    for (const [, instance] of this._instances) {
                        yield* instance.collect();
                    }
                }.bind(this))()
            }
        }.bind(this))();
    }

    labels(labels: Labels): T {
        const key = Metric.encodeKey(labels);

        const instance = this._instances.get(key);
        if (instance) {
            return instance;
        }

        const newInstance = this.createInstance(labels);
        this._instances.set(key, newInstance);

        return newInstance;
    }

    protected abstract createInstance(labels: IMetricLabels): T

    private static encodeKey<Labels>(labels: Labels): string {
        return Object
            .entries(labels)
            .sort(([ka,], [kb,]) => ka < kb ? -1 : ka > kb ? 1 : 0)
            .map(([, v]) => String(v))
            .join('-');
    }
}
