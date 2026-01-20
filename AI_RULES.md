# AI Rules for EduQuest Application

## Tech Stack Overview

- **Frontend Framework**: React with TypeScript
- **UI Library**: shadcn/ui components (built on Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query (TanStack Query) for server state
- **Authentication**: Supabase Auth with custom context
- **Database**: Supabase PostgreSQL with realtime capabilities
- **Routing**: React Router DOM for client-side navigation
- **Animations**: Framer Motion for UI animations
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React icon library

## Library Usage Rules

### UI Components
- **ALWAYS** use shadcn/ui components as the primary UI library
- **DO NOT** import or use raw Radix UI components directly - use the shadcn wrappers
- For custom components, extend shadcn components rather than building from scratch
- Use Tailwind CSS classes for all styling - avoid inline styles

### Data Fetching
- **ALWAYS** use React Query (TanStack Query) for all data fetching
- **NEVER** use fetch or axios directly in components
- Use Supabase client only within React Query functions
- Keep all query keys consistent and documented

### State Management
- Use React Query for server state
- Use React context for global client state (like auth)
- Use local component state for UI state
- Avoid complex state management libraries

### Authentication
- **ALWAYS** use the existing AuthContext for authentication
- **NEVER** call Supabase auth methods directly in components
- Use the provided signIn, signUp, signOut methods
- Store minimal user data in context

### Database Operations
- Use Supabase client for all database operations
- **ALWAYS** handle errors appropriately
- Use transactions for related operations
- Keep database calls within React Query functions

### Routing
- Use React Router DOM for all routing
- Keep route definitions in src/App.tsx
- Use NavLink for navigation links
- Protect routes using the auth context

### Forms
- Use React Hook Form for all form handling
- Use Zod for form validation
- Integrate with shadcn form components
- Handle form submission with proper error handling

### Icons
- Use Lucide React for all icons
- Import icons individually
- Use consistent icon sizes (typically 16x16 or 20x20)
- Follow the existing icon naming conventions

### Animations
- Use Framer Motion for complex animations
- Keep animations subtle and performance-friendly
- Use CSS animations for simple transitions
- Follow the existing animation patterns

### Error Handling
- Use the existing toast notification system
- Provide clear, user-friendly error messages
- Log errors appropriately
- Handle edge cases gracefully

### Code Organization
- Follow the existing file structure
- Keep components small and focused
- Use TypeScript interfaces for props
- Document complex logic with comments