import { Summary } from "./Summary";
import { MetricBuilder } from "../metric/MetricBuilder";

import { IMetricLabels } from "../metric/IMetricLabels";
import { ISummaryBuilderOpts } from "./ISummaryBuilderOpts";
import { defaultTimeProvider } from "../time/DefaultTimeProvider";
import { ITimeProvider } from "../time/ITimeProvider";

export class SummaryBuilder<Labels extends IMetricLabels = Record<string, never>> extends MetricBuilder<SummaryBuilder<Labels>, ISummaryBuilderOpts, Summary<Labels>, Labels> {
    constructor(opts: Partial<ISummaryBuilderOpts> = {}) {
        super({
            ...opts,
            quantiles: opts.quantiles || [],
            maxAge: opts.maxAge || (10 * 60),
            ageBuckets: opts.ageBuckets || 5,
            timeProvider: opts.timeProvider || defaultTimeProvider
        });
    }

    quantile(quantile: number, error: number): SummaryBuilder<Labels> {
        if (quantile < 0 || quantile > 1) {
            throw new Error("Quantile must be between 0 and 1");
        }

        if (error < 0 || error > 1) {
            throw new Error("Error must be between 0 and 1");
        }

        return this.createBuilder({
            ...this._opts,
            quantiles: this._opts.quantiles.concat({quantile, error})
        });
    }

    maxAge(maxAge: number): SummaryBuilder<Labels> {
        if (maxAge <= 0) {
            throw new Error("maxAge must be positive");
        }

        return this.createBuilder({
            ...this._opts,
            maxAge
        });
    }

    ageBuckets(ageBuckets: number): SummaryBuilder<Labels> {
        if (ageBuckets <= 0) {
            throw new Error("ageBuckets must be positive");
        }

        return this.createBuilder({
            ...this._opts,
            ageBuckets
        });
    }

    timeProvider(timeProvider: ITimeProvider): SummaryBuilder<Labels> {
        if (!timeProvider) {
            throw new Error("timeProvider must be set");
        }

        return this.createBuilder({
            ...this._opts,
            timeProvider
        });
    }

    createBuilder<T extends IMetricLabels>(opts: Partial<ISummaryBuilderOpts>) {
        return new SummaryBuilder<T>(opts);
    }

    create(): Summary<Labels> {
        return new Summary<Labels>({
            namespace: this._opts.namespace,
            name: this._opts.name,
            help: this._opts.help,
            constLabels: this._opts.constLabels,

            quantiles: this._opts.quantiles,
            maxAge: this._opts.maxAge,
            ageBuckets: this._opts.ageBuckets,
            timeProvider: this._opts.timeProvider
        });
    }
}
