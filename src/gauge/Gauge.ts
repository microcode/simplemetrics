import { Metric } from "../metric/Metric";
import { GaugeInstance } from "./GaugeInstance";

import { IMetricInstance } from "../metric/IMetricInstance";
import { IGaugeInstance } from "./IGaugeInstance";
import { MetricType } from "../metric/MetricType";
import { IMetricLabels } from "../metric/IMetricLabels";

export class Gauge<L extends IMetricLabels> extends Metric<IMetricInstance & IGaugeInstance, L> {
    _type = MetricType.Gauge

    createInstance(labels: IMetricLabels) {
        return new GaugeInstance(this, labels);
    }
}
