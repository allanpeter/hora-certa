# Hora Certa Frontend

React + TypeScript frontend for the Hora Certa barber shop management system.

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Create .env file from template
cp ../.env.example .env.local

# Update .env.local with your configuration
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=your-apple-client-id

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/      # Reusable React components
├── pages/          # Page components (routes)
├── hooks/          # Custom React hooks
├── services/       # API service functions
├── stores/         # Zustand state management
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── config/         # Configuration
├── styles/         # Global styles
├── App.tsx         # Root component
└── main.tsx        # Application entry point
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Lint code
- `pnpm format` - Format code with Prettier

## Key Libraries

- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Environment Variables

```
VITE_API_URL=http://localhost:3001      # Backend API URL
VITE_ENVIRONMENT=development             # Environment type
VITE_GOOGLE_CLIENT_ID=your-id           # Google OAuth ID
VITE_APPLE_CLIENT_ID=your-id            # Apple OAuth ID
```

## Development Tips

- Use React Query for fetching and caching server data
- Use Zustand for global UI state (auth, user preferences)
- Keep components small and focused
- Use TypeScript for type safety
- Follow mobile-first responsive design

## Mobile Responsiveness

The app is built mobile-first using Tailwind CSS breakpoints:
- `sm:` (640px)
- `md:` (768px)
- `lg:` (1024px)
- `xl:` (1280px)

Test on mobile devices/browsers during development.

## Performance Optimization

- Code splitting with React Router
- Image optimization
- Lazy loading components
- React Query caching
- Production build optimization with Vite

## Testing

```bash
# Run tests (to be configured)
pnpm test
```

## Building for Production

```bash
# Create optimized production build
pnpm build

# Preview the build locally
pnpm preview
```

The build output will be in the `dist/` directory.

## Troubleshooting

### API connection errors
- Ensure backend is running on `http://localhost:3001`
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

### Port already in use
- Change port in `vite.config.ts`
- Or kill process: `lsof -ti :5173 | xargs kill -9`

### Build errors
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear Vite cache: `rm -rf dist`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari 12+
- Android Chrome

## Contributing

1. Follow React best practices
2. Use TypeScript for type safety
3. Write components as functional components
4. Keep components pure and testable
5. Use meaningful commit messages
