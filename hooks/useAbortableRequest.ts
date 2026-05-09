"use client";

import { useCallback, useRef } from "react";

import type { ApiResult } from "@/utils/api/paymentApi";
import { createTimeout, type TimeoutHandle } from "@/utils/timeout";

export function useAbortableRequest() {
  const controllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<TimeoutHandle | null>(null);
  const timedOutRef = useRef(false);

  const cancel = useCallback((): void => {
    timedOutRef.current = false;
    timeoutRef.current?.clear();
    timeoutRef.current = null;
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const run = useCallback(
    async <T,>(task: (signal: AbortSignal) => Promise<ApiResult<T>>, timeoutMs: number): Promise<ApiResult<T>> => {
      cancel();
      const controller = new AbortController();
      controllerRef.current = controller;
      timedOutRef.current = false;

      const timeout = createTimeout(timeoutMs, () => {
        timedOutRef.current = true;
        controller.abort();
      });
      timeoutRef.current = timeout;

      const result = await task(controller.signal);

      const didTimeout = timeout.didTimeout() || timedOutRef.current;
      timeout.clear();
      timeoutRef.current = null;
      controllerRef.current = null;
      timedOutRef.current = false;

      if (!result.ok && result.kind === "aborted" && didTimeout) {
        return { ok: false, kind: "timeout", message: "Payment request timed out." };
      }
      return result;
    },
    [cancel],
  );

  return { run, cancel };
}
