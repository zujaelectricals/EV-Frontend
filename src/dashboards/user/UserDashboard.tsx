import { Navigate } from 'react-router-dom';

export const UserDashboard = () => {
  // Redirect to profile page - no separate dashboard needed
  return <Navigate to="/profile" replace />;
};
