import { IMetric } from "./IMetric";
import { IMetricInstance } from "./IMetricInstance";
import { ICollectedMetricValue } from "../ICollectedMetricValue";
import { IMetricLabels } from "./IMetricLabels";

export abstract class MetricInstance implements IMetricInstance {
    _metric: IMetric
    _labels: ReadonlyMap<string, string>

    constructor(metric: IMetric, labels: IMetricLabels) {
        this._metric = metric;
        this._labels = new Map(Object.entries(labels));
    }

    get metric() {
        return this._metric;
    }

    get labels() {
        return this._labels;
    }

    abstract collect(): IterableIterator<ICollectedMetricValue>
}
