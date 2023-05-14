import { IMetricBuilderOpts } from "../metric/IMetricBuilderOpts"
import { ITimeProvider } from "../time/ITimeProvider"
import { IQuantile } from "./ISummaryOpts"

export interface ISummaryBuilderOpts extends IMetricBuilderOpts {
    quantiles: IQuantile[]
    maxAge: number
    ageBuckets: number
    timeProvider: ITimeProvider
}
