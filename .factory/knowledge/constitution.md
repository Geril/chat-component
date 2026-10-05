# Repository Constitution

## Principles

- This repository implements a React and TypeScript streaming-chat web application, built with Vite.
- Chat responses are streamed from the browser using Server-Sent Events (SSE).
- The user's original message is retained for display; the request body is passed through the client-side PII scrubber before the fetch request is sent.
- The development server includes a mock `/iq` endpoint and a dev-only scenario selector for exercising response and error states.

## Non-negotiables

- The current transport boundary sends a JSON body containing the scrubbed `message` field to `POST /iq`; no user identifier or additional personal fields are included by this client.
- The current PII scrubber recognizes email, credit-card, US SSN, phone, and IPv4 patterns. Its source documents that regex matching does not detect all free-form PII and can produce phone-number false positives.
- The scenario selector is guarded as development-only and is excluded from production builds by Vite/Rollup dead-code elimination.
- [NEEDS CLARIFICATION: Are there formal project principles or required invariants beyond those observable in the current implementation?]
