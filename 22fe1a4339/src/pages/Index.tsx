import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to the shorten page as the main page
  return <Navigate to="/shorten" replace />;
};

export default Index;