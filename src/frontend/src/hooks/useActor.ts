// useActor hook — provides a typed HNCoachActor for backend calls.
// Falls back to no-op when canister is unavailable.

import { useEffect, useState } from "react";
import { type HNCoachActor, createActorWithConfig } from "../config";

interface UseActorResult {
  actor: HNCoachActor | null;
  isFetching: boolean;
}

export function useActor(): UseActorResult {
  const [actor, setActor] = useState<HNCoachActor | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let cancelled = false;
    createActorWithConfig()
      .then((a) => {
        if (!cancelled) setActor(a);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { actor, isFetching };
}
