import { env, isLiveBrokerConfigured, isAngelOneConfigured } from "../config/env";
import type { BrokerAdapter } from "./BrokerAdapter";
import { PaperBrokerAdapter } from "./PaperBrokerAdapter";
import { ConfiguredBrokerAdapter } from "./ConfiguredBrokerAdapter";
import { AngelOneBrokerAdapter } from "./AngelOneBrokerAdapter";

export class BrokerManager {
  private adapter: BrokerAdapter;

  constructor() {
    if (env.BROKER_PROVIDER === "angelone" || (env.BROKER_PROVIDER === "configured" && isAngelOneConfigured)) {
      this.adapter = new AngelOneBrokerAdapter();
    } else if (env.BROKER_PROVIDER === "configured" && isLiveBrokerConfigured) {
      this.adapter = new ConfiguredBrokerAdapter();
    } else {
      this.adapter = new PaperBrokerAdapter();
    }
  }

  getAdapter(): BrokerAdapter {
    return this.adapter;
  }

  isPaper(): boolean {
    return this.adapter.name === "PaperBrokerAdapter";
  }
}

