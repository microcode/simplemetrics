import { Metric } from "../metric/Metric";
import { CounterInstance } from "./CounterInstance";

import { IMetricInstance } from "../metric/IMetricInstance";
import { ICounterInstance } from "./ICounterInstance";
import { MetricType } from "../metric/MetricType";
import { IMetricLabels } from "../metric/IMetricLabels";

export class Counter<Labels extends IMetricLabels> extends Metric<IMetricInstance & ICounterInstance, Labels> {
    _type = MetricType.Counter

    createInstance(labels: IMetricLabels) {
        return new CounterInstance(this, labels);
    }
}
