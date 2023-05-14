import { Gauge } from "./Gauge";
import { MetricBuilder } from "../metric/MetricBuilder";

import { IMetricLabels } from "../metric/IMetricLabels";
import { IMetricBuilderOpts } from "../metric/IMetricBuilderOpts";

export class GaugeBuilder<Labels extends IMetricLabels = Record<string, never>> extends MetricBuilder<GaugeBuilder<Labels>, IMetricBuilderOpts, Gauge<Labels>, Labels> {
    createBuilder<T extends IMetricLabels>(opts: Partial<IMetricBuilderOpts>) {
        return new GaugeBuilder<T>(opts);
    }

    create(): Gauge<Labels> {
        return new Gauge<Labels>({
            namespace: this._opts.namespace,
            name: this._opts.name,
            help: this._opts.help,
            constLabels: this._opts.constLabels
        });
    }
}
