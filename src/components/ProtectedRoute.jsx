import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../services/supabase';

// Mock auth check for now, can be improved with real context
// In a real app we'd use a context provider to hold session state
export default function ProtectedRoute() {
    // Placeholder: Assume not authenticated by default or check token
    // For now allowing access to visualize UI or blocking.
    // Ideally, use a proper Auth Hook.

    const isAuthenticated = false; // Set to true to test admin routes manually if needed

    if (!isAuthenticated) {
        // For development, you might want to comment this out or handle it
        // return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
