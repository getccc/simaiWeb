import { PiniaPluginContext } from "pinia";

declare module "pinia" {
  export interface DefineStoreOptionsBase {
    persist?:
      | boolean
      | {
          enabled: boolean;
          strategies?: Array<{
            key?: string;
            storage?: Storage;
            paths?: string[];
          }>;
        };
  }
}
