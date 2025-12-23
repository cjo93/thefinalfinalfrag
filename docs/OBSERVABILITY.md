# Observability — Defrag

## Goals
- Structured logs with request IDs.  
- APM traces (OpenTelemetry / Datadog).  
- Uptime checks and dashboards for latency, error rates, and queue depth.

## Implementation
1. Add `src/utils/logger.ts` using `pino` with `request-id` middleware.  
2. Instrument critical endpoints with spans (OpenTelemetry or Datadog APM SDK).  
3. Export Prometheus metrics (via `/metrics`) for queue length, job latencies, and request latencies.  
4. Create dashboards (APM + Grafana/Datadog) and alerts (alert if 95p latency > X ms, error rate > Y%, queue depth > Z).

## Acceptance
- Dashboards with latency, error rate, queue depth.  
- Alerts firing on thresholds.  
- Logs include request IDs and structured error fields.

