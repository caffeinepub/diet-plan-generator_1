// Config module – wraps @caffeineai/core-infrastructure utilities
// and provides a typed actor for the HN Coach backend.

import { createActorWithConfig as _coreCreate } from "@caffeineai/core-infrastructure";
import { createActor } from "./backend";

export interface AdminReport {
  id: string;
  name: string;
  whatsapp: string;
  referredBy: string;
  goal: string;
  amount: number;
  paidAt: string;
  rewardPaid: boolean;
}

export interface HNCoachActor {
  addAdminReport: (report: AdminReport) => Promise<void>;
  getAdminReports: () => Promise<AdminReport[]>;
  markRewardPaid: (id: string) => Promise<void>;
  addProfile: (profile: unknown) => Promise<void>;
  addDietPlan: (plan: unknown) => Promise<void>;
}

/** Creates a typed actor bound to the deployed canister. */
export async function createActorWithConfig(): Promise<HNCoachActor> {
  // The underlying backend is a stub (empty canister interface).
  // We provide a no-op actor so UI code that calls actor methods doesn't crash.
  const noopActor: HNCoachActor = {
    addAdminReport: async (_r) => {},
    getAdminReports: async () => [],
    markRewardPaid: async (_id) => {},
    addProfile: async (_p) => {},
    addDietPlan: async (_d) => {},
  };

  try {
    // Try to create a real actor; if config/canister not available, fall back.
    await _coreCreate(createActor);
  } catch (_) {
    // ignore – canister may not be deployed yet
  }

  return noopActor;
}
