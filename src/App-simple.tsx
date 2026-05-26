import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import TestPage from './TestPage';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="sports-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/test" element={<TestPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;