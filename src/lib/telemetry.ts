type TelemetryPayload = Record<string, unknown>;

export function track(event: string, payload: TelemetryPayload = {}) {
  if (typeof window === "undefined") return;
  // Lightweight client-side telemetry hook for launch KPIs.
  console.info("[telemetry]", event, payload);
}
