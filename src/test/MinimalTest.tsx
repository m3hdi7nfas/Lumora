import React from 'react';

export default function MinimalTest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Minimal Test</h1>
        <p>If you see this, the basic React rendering is working.</p>
        <button
          onClick={() => alert('Button clicked!')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Button
        </button>
      </div>
    </div>
  );
}