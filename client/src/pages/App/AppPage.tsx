import React from 'react';
import { Redirect } from 'wouter';

const AppPage: React.FC = () => {
  return <Redirect to="/dashboard" />;
};

export default AppPage;
