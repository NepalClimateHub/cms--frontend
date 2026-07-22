# NCH CMS Frontend — Admin Dashboard



## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (TypeScript) |
| Build tool | Vite |
| UI components | shadcn/ui + Tailwind CSS |
| Routing | TanStack Router |
| API client | openapi-typescript (auto-generated) |
| Package manager | npm |

## Prerequisites

- Node.js ≥ 18
- npm

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/NepalClimateHub/cms--frontend.git
cd cms--frontend
npm install
```

### 2. Configure environment

Create a `.env.local` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Point `VITE_API_BASE_URL` at your running [CMS Backend](https://github.com/NepalClimateHub/cms--backend) instance.

### 3. Start the development server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run codegen:local` | Re-generate API client from local OpenAPI spec |

## Folder Structure

The frontend keeps route definitions, feature code, API/query helpers, schemas, and reusable UI separated by responsibility:

```
src/
├── api/              # Generated API client and API helpers
├── config/           # App-level configuration
├── constants/        # Shared constants
├── context/          # React context providers
├── data/             # Static data used by the UI
├── features/         # Domain features such as auth, blogs, projects, users, and Ask AI
├── hooks/            # Shared React hooks
├── query/            # TanStack Query hooks grouped by domain
├── routes/           # TanStack Router route files
├── schemas/          # Validation schemas grouped by domain
├── stores/           # Client-side state stores
├── ui/
│   ├── layouts/      # Layout shells and layout data
│   ├── molecules/    # Reusable composed UI pieces
│   ├── organisms/    # Larger dashboard sections
│   ├── pages/        # Page-level UI composition
│   ├── shadcn/       # shadcn/ui components and helpers
│   └── templates/    # Reusable page templates
├── utils/            # Shared utility functions
├── main.tsx          # App entry point
└── routeTree.gen.ts  # Generated TanStack Router tree
```

## Related Services

| Service | Port | Repository |
|---|---|---|
| CMS Backend | 8080 | [cms--backend](https://github.com/NepalClimateHub/cms--backend) |
| NCH Climate Assistant | 8000 | [NCH-Climate-Assistant](https://github.com/NepalClimateHub/NCH-Climate-Assistant) |

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change. See [CHANGELOG.md](./CHANGELOG.md) for release history.

## Screenshot

![CMS Dashboard](https://github.com/NepalClimateHub/cms--frontend/blob/develop/public/images/cms_screenshot.png)

## License

MIT License — see [LICENSE](./LICENSE) for details.
