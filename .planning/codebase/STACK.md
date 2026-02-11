# Technology Stack

**Analysis Date:** 2026-02-11

## Languages

**Primary:**
- TypeScript 5.x - Used for all source code, configuration, and type safety across the application

**Secondary:**
- JavaScript - Runtime language (Node.js environment)

## Runtime

**Environment:**
- Node.js 18+ (based on dependencies and Next.js 15 requirements)
- NPM as package manager

**Package Manager:**
- NPM 11.6.2
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 15.x - Full-stack React framework with App Router, built-in optimization, and Turbopack for development
- React 19.x - UI component library
- React DOM 19.x - DOM rendering for React

**Build/Dev:**
- Turbopack - Fast incremental bundler used in development (`next dev --turbopack`)
- Next.js built-in TypeScript support

## Key Dependencies

**Critical:**
- `next@^15` - Full-stack web framework (App Router, API routes, optimization)
- `react@^19` - Core UI library
- `react-dom@^19` - React rendering library

**Type Safety:**
- `typescript@^5` - Language support and type checking
- `@types/node@^22` - Node.js type definitions
- `@types/react@^19` - React type definitions
- `@types/react-dom@^19` - React DOM type definitions

## Configuration

**TypeScript:**
- Config file: `tsconfig.json`
- Target: ES2017
- Module system: ESNext with bundler resolution
- Path aliases: `@/*` maps to `./src/*`
- Strict mode enabled: `strict: true`
- JSX: Preserved for Next.js processing

**Next.js:**
- Config file: `next.config.ts` (empty default configuration)
- Allows for future customization of webpack, environment variables, redirects, etc.

**Build Scripts:**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run linting via Next.js lint command

## Platform Requirements

**Development:**
- Node.js 18 or higher
- NPM 6 or higher
- TypeScript compiler support
- Modern terminal/shell for running npm scripts

**Production:**
- Node.js 18+ runtime environment
- Typical deployment targets: Vercel (optimized), Node.js servers, containerized environments (Docker)

---

*Stack analysis: 2026-02-11*
