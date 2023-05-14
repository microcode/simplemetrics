import { INamespace } from "../namespace/INamespace";

export interface IMetricBuilderOpts {
    namespace: INamespace
    name: string
    help?: string
    constLabels: Map<string, string>
}
