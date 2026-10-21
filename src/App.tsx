import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SocialTrainingDashboard } from './components/dashboard/SocialTrainingDashboard';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SocialTrainingDashboard />
    </ThemeProvider>
  );
};

export default App;
