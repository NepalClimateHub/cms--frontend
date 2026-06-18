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

This project follows the **atomic design** methodology:

```
src/
├── components/
│   ├── atoms/        # Smallest UI building blocks (buttons, inputs, icons)
│   ├── molecules/    # Composed atoms (cards, dialogs, tables)
│   ├── organisms/    # Page sections (header, footer, sidebars)
│   ├── templates/    # Page-level layout components
│   └── shadcn/       # Downloaded shadcn/ui components
└── pages/            # Complete pages composed of templates
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
