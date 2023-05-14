import { Counter } from "./Counter";
import { MetricBuilder } from "../metric/MetricBuilder";

import { IMetricLabels } from "../metric/IMetricLabels";
import { IMetricBuilderOpts } from "../metric/IMetricBuilderOpts";

export class CounterBuilder<Labels extends IMetricLabels = Record<string, never>> extends MetricBuilder<CounterBuilder<Labels>, IMetricBuilderOpts, Counter<Labels>, Labels> {
    createBuilder<T extends IMetricLabels>(opts: Partial<IMetricBuilderOpts>) {
        return new CounterBuilder<T>(opts);
    }

    create(): Counter<Labels> {
        return new Counter<Labels>({
            namespace: this._opts.namespace,
            name: this._opts.name,
            help: this._opts.help,
            constLabels: this._opts.constLabels
        });
    }
}
