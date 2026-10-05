# Glossary

## Terms

- **AI message**: A chat response represented with role `ai`; it is received as streamed tokens and then committed to the conversation.
- **Chat status**: One of `idle`, `loading`, `streaming`, or `error`, as defined in `src/types/chat.ts`.
- **Mock scenario**: A development-only behavior selectable in the UI: default, HTTP error, slow tokens, mid-stream error, initial delay, empty response, or long response.
- **PII**: Personally identifiable information. This client detects or scrubs supported email, credit-card, US SSN, phone, and IPv4 patterns. The implementation notes that regex matching has limitations.
- **SSE (Server-Sent Events)**: The text/event-stream format used by the client to receive response tokens, an `error` event, and the `[DONE]` sentinel.
- **Streaming bubble**: The in-progress assistant response shown while tokens arrive, before the completed or partial response is committed as a message.
- **`/iq`**: The path used by the client for `POST` requests and handled by the Vite development mock. [NEEDS CLARIFICATION: What does “IQ” stand for, and is `/iq` also the production API path?]
