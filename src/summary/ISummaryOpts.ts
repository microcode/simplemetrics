import { IMetricOpts } from "../metric/IMetricOpts";
import { ITimeProvider } from "../time/ITimeProvider";

export interface IQuantile {
    quantile: number,
    error: number
}


export interface ISummaryOpts extends IMetricOpts {
    quantiles: IQuantile[]
    maxAge: number,
    ageBuckets: number,
    timeProvider: ITimeProvider
}