# Repository Structure

## Directories

- `src/`: React/TypeScript application code.
  - `src/components/chat/`: chat-specific UI components.
  - `src/components/ui/`: shared UI primitives.
  - `src/hooks/`: React stateful hooks, including chat orchestration.
  - `src/lib/`: chat transport, PII guard, and utility functions.
  - `src/types/`: shared TypeScript domain types.
- `mock/`: Vite development middleware for the mock IQ streaming endpoint.
- `.factory/knowledge/`: repository knowledge documents.
- Root configuration includes `vite.config.ts`, `tsconfig.json`, `eslint.config.mjs`, PostCSS configuration, Tailwind/shadcn configuration, and `package.json`.

The root `README.md` currently contains only the project heading and no setup or product description.

## Build and test

- Package manager: Yarn 4.16.0, as declared in `package.json`; dependencies are locked in `yarn.lock`.
- `yarn dev`: start the Vite development server, including the mock `/iq` middleware.
- `yarn build`: run TypeScript (`tsc`) followed by the Vite production build.
- `yarn preview`: serve the production build locally with Vite preview.
- `yarn lint`: run ESLint over `src/`.
- No test script or test-runner configuration was found in `package.json` or the repository files inspected. [NEEDS CLARIFICATION: Is there a separate test suite or expected test command?]
