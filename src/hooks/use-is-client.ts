import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => {};
}

/** True after hydration; false on the server and during the first client render. */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
