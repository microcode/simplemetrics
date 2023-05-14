import { INamespace } from "../namespace/INamespace";
import { IMetricBuilderOpts } from "./IMetricBuilderOpts";
import { IMetricLabels } from "./IMetricLabels";

export abstract class MetricBuilder<Builder, Opts extends IMetricBuilderOpts, MetricClass, Labels extends IMetricLabels> {
    _opts: Partial<Opts>

    constructor(opts: Partial<Opts> = {}) {
        this._opts = {
            ...opts,
            constLabels: opts.constLabels || new Map()
        };
    }

    namespace(namespace: INamespace): Builder {
        return this.createBuilder<Labels>({
            ...this._opts,
            namespace
        });
    }

    name(name: string): Builder {
        return this.createBuilder<Labels>({
            ...this._opts,
            name
        });
    }

    help(help: string): Builder {
        return this.createBuilder<Labels>({
            ...this._opts,
            help
        })
    }

    constLabels(constLabels: IMetricLabels): Builder {
        return this.createBuilder<Labels>({
            ...this._opts,
            constLabels: new Map(Object.entries(constLabels))
        });
    }

    build(): MetricClass {
        this.validate();
        return this.create();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    abstract createBuilder<T extends IMetricLabels>(opts: Partial<Opts>) : Builder;
    protected abstract create(): MetricClass

    validate() {
        if (this._opts.namespace === undefined) {
            throw new Error("Namespace not provided");
        }

        if (this._opts.name === undefined) {
            throw new Error("Name not provided");
        }
    }
}