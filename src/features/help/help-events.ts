type Listener = () => void;

let listeners: Set<Listener> = new Set();

export function onHelpOpen(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function triggerHelpOpen() {
  listeners.forEach((fn) => fn());
}
