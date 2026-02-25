/**
 * Routes Configuration Example
 * 
 * Add these routes to your router configuration
 */

import { lazy } from 'react';

// Lazy load pages for better performance
const StoryStudioPage = lazy(() => import('../pages/StoryStudioPage'));
const StoryDetailPage = lazy(() => import('../pages/StoryDetailPage'));
const MyStoriesPage = lazy(() => import('../pages/MyStoriesPage'));
const StoryFeed = lazy(() => import('../components/story/StoryFeed'));

/**
 * Story Routes
 * 
 * Add these to your main Routes component
 */
export const storyRoutes = [
  // Story Studio - Create new AI-generated story
  {
    path: '/stories/create',
    element: <StoryStudioPage />,
    protected: true, // Requires authentication
  },
  
  // My Stories - User's story dashboard
  {
    path: '/stories/my-stories',
    element: <MyStoriesPage />,
    protected: true,
  },
  
  // Story Detail - View single story with interactions
  {
    path: '/stories/:id',
    element: <StoryDetailPage />,
    protected: false, // Public stories are viewable by anyone
  },
  
  // Story Feed - Browse all stories
  {
    path: '/stories',
    element: <StoryFeed />,
    protected: false,
  },
];

/**
 * Example Integration with React Router v6
 */

// In your main App.tsx or Routes.tsx:

/*
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoryGenerationProvider } from './context/StoryGenerationContext';
import { storyRoutes } from './routes/storyRoutes';

function App() {
  return (
    <BrowserRouter>
      <StoryGenerationProvider>
        <Routes>
          {storyRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.protected ? (
                  <ProtectedRoute>{route.element}</ProtectedRoute>
                ) : (
                  route.element
                )
              }
            />
          ))}
          
          {/* Your other routes *\/}
        </Routes>
      </StoryGenerationProvider>
    </BrowserRouter>
  );
}

// Protected Route Component (if you don't have one)
function ProtectedRoute({ children }) {
  const isAuthenticated = // Check your auth state
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
*/

/**
 * Navigation Links for Your UI
 */

/*
// In your navigation/header component:

import { Link } from 'react-router-dom';

<nav>
  <Link to="/stories">Browse Stories</Link>
  <Link to="/stories/create">Create Story</Link>
  <Link to="/stories/my-stories">My Stories</Link>
</nav>
*/

/**
 * URL Structure
 */

/*
/stories                    - Browse all stories (public)
/stories/create             - Create new story (protected)
/stories/my-stories         - User's story dashboard (protected)
/stories/:id                - View single story (public if story is public)
/stories/:id/edit           - Edit story (protected, owner only)
*/
