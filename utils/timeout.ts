export interface TimeoutHandle {
  clear: () => void;
  didTimeout: () => boolean;
}

export function createTimeout(ms: number, onTimeout: () => void): TimeoutHandle {
  let timedOut = false;
  const id = window.setTimeout(() => {
    timedOut = true;
    onTimeout();
  }, ms);

  return {
    clear: () => window.clearTimeout(id),
    didTimeout: () => timedOut,
  };
}

