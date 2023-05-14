import { ICollectedMetricValue } from "../ICollectedMetricValue";
import { IMetric } from "../metric/IMetric";
import { IMetricLabels } from "../metric/IMetricLabels";
import { MetricInstance } from "../metric/MetricInstance";
import { ITimeProvider } from "../time/ITimeProvider";

import { ISummaryInstance, TimedFunction } from "./ISummaryInstance";
import { IQuantile } from "./ISummaryOpts";
import { Quantile } from "./QuantileDigest";
import { TimeWindowQuantiles } from "./TimeWindowQuantiles";

export class SummaryInstance extends MetricInstance implements ISummaryInstance {
    _timeProvider: ITimeProvider
    _count = 0
    _sum = 0
    _quantileValues: TimeWindowQuantiles | null = null

    constructor(metric: IMetric, labels: IMetricLabels, quantiles: IQuantile[], maxAge: number, ageBuckets: number, timeProvider: ITimeProvider) {
        super(metric, labels);
        this._timeProvider = timeProvider;

        if (quantiles.length > 0) {
            this._quantileValues = new TimeWindowQuantiles(
                quantiles.map(q => new Quantile(q.quantile, q.error)),
                maxAge,
                ageBuckets,
                timeProvider
            );
        }
    }

    observe(value: number) {
        ++ this._count;
        this._sum += value;
        if (this._quantileValues) {
            this._quantileValues.insert(value);
        }
    }

    async time<T>(fn: TimedFunction<T>): Promise<T> {
        const start = this._timeProvider.getTime();
        const response = await fn();
        const end = this._timeProvider.getTime();

        this.observe(end - start);

        return response;
    }

    get count() {
        return this._count;
    }

    get sum() {
        return this._sum;
    }

    collect(): IterableIterator<ICollectedMetricValue> {
        return (function* (): Generator<ICollectedMetricValue, void, unknown> {
            // count
            yield {
                suffix: "count",
                labels: this.labels,
                value: this._count
            };

            // sum
            yield {
                suffix: "sum",
                labels: this.labels,
                value: this._sum
            };

            // quantiles
            if (this._quantileValues) {
                for (const quantile of this._quantileValues.quantiles) {
                    const value = this._quantileValues.get(quantile.quantile);
                    const labels = new Map<string,string>(this.labels.entries());
                    labels.set("quantile",quantile.quantile.toString());
                    yield {
                        labels,
                        value
                    };
                }
            }
        }.bind(this))();
    }
}