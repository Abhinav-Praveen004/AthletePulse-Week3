import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          🏅 SportsAI - Test Page
        </h1>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Project Status</h2>
          <div className="space-y-2">
            <p className="text-green-600">✅ React is working</p>
            <p className="text-green-600">✅ Tailwind CSS is working</p>
            <p className="text-green-600">✅ TypeScript is working</p>
            <p className="text-green-600">✅ Vite is working</p>
          </div>
          <div className="mt-6">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Test Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;