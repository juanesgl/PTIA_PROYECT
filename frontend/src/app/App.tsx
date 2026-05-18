import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { StudentProvider } from './context/StudentContext';

export default function App() {
  return (
    <StudentProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </StudentProvider>
  );
}
