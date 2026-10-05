# Architecture

## Overview

The application is a single-page React chat interface. Vite serves the client and installs a local development middleware that mocks `POST /iq`. The client sends the user's message to that endpoint and consumes a streamed SSE response. The repository does not identify a production backend or describe the intended deployment.

## Components

- `src/main.tsx` loads global styles, locates the `#root` element, and mounts `App` in React `StrictMode`.
- `src/app.tsx` provides the centered page layout and renders the chat.
- `src/components/chat/` contains the chat UI: composer, scrollable message list, message/streaming bubbles, loading and empty-response notices, and a development scenario switcher.
- `src/hooks/use-chat.ts` owns conversation messages, status and errors; it calls the streaming client, handles cancellation and retry, and commits completed or partial AI responses.
- `src/lib/chat-client.ts` posts scrubbed user content to `/iq`, parses SSE events, and exposes HTTP and stream errors.
- `src/lib/pii-guard.ts` detects and replaces supported PII patterns. The input uses detection for a warning; the client uses scrubbing at the transport boundary.
- `src/types/chat.ts` defines messages, chat statuses, error kinds, and mock scenario names.
- `src/components/ui/` contains shared button, badge, and textarea primitives.
- `mock/iq-plugin.ts` implements the Vite development middleware and canned SSE mock scenarios.

## Data flow

1. The user submits text through `ChatInput`; the chat hook adds a user message and sets the conversation to loading.
2. `streamResponse` scrubs the text and sends `{ "message": <scrubbed text> }` to `POST /iq`. In development, `mockIqPlugin` handles the request and selects a mock behavior from the optional `mock` query parameter.
3. The client parses SSE data events and yields response tokens. The hook appends streamed tokens to the mounted streaming bubble and accumulates the same text for the final message.
4. On `[DONE]`, the hook commits the accumulated AI message. A stream error after tokens commits a partial message; a request failure before tokens sets a conversation-level error. Aborted requests are ignored.
5. The message list displays committed messages and the active streaming bubble; retry resends the last submitted text.

[NEEDS CLARIFICATION: What production service, if any, implements `POST /iq`, and what does “IQ” refer to?]
