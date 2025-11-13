# Frontend - Enterprise Experience Platform

React/Next.js frontend application with mobile support (React Native) and comprehensive UI components.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Storybook** for component development
- **Apollo Client** for GraphQL
- **SWR** for data fetching
- **Recharts** for data visualization
- **Framer Motion** for animations

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Storybook
npm run storybook
```

## Project Structure

- `src/` - Application source code
  - `api/` - API client configurations
  - `components/` - App-specific components
  - `hooks/` - Custom React hooks
  - `pages/` - Next.js pages
  - `services/` - Business logic services
  - `styles/` - Global styles
- `ui/` - Shared UI components and design system
  - `components/` - Reusable UI components
  - `themes/` - Tailwind themes and configurations
  - `storybook/` - Storybook stories
- `mobile/` - React Native mobile application

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
```

