import { Metric } from "../metric/Metric";
import { SummaryInstance } from "./SummaryInstance";

import { IMetricInstance } from "../metric/IMetricInstance";
import { ISummaryInstance } from "./ISummaryInstance";
import { MetricType } from "../metric/MetricType";
import { ISummaryOpts } from "./ISummaryOpts";
import { IMetricLabels } from "../metric/IMetricLabels";

export class Summary<Labels extends IMetricLabels> extends Metric<IMetricInstance & ISummaryInstance, Labels, ISummaryOpts> {
    _type = MetricType.Summary

    createInstance(labels: IMetricLabels) {
        return new SummaryInstance(this, labels, this._opts.quantiles, this._opts.maxAge, this._opts.ageBuckets, this._opts.timeProvider);
    }
}
