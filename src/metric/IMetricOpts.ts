import { INamespace } from "../namespace/INamespace";

export interface IMetricOpts {
    namespace: INamespace
    name: string
    help?: string
    constLabels: ReadonlyMap<string, string>
}
