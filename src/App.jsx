import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import DesignProposal from './pages/DesignProposal';
import Visualizer from './pages/Visualizer';
import VisualizerShare from './pages/VisualizerShare';
import AdminVisualizer from './pages/AdminVisualizer';
import BookConsultation from './pages/BookConsultation';
import AdminConsultations from './pages/AdminConsultations';
import AdminQuotes from './pages/AdminQuotes';
import QuoteView from './pages/QuoteView';
import AdminNewQuote from './pages/AdminNewQuote';
import React, { Suspense } from 'react';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <LoadingSpinner />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="/DesignProposal" element={<LayoutWrapper currentPageName="DesignProposal"><DesignProposal /></LayoutWrapper>} />
        <Route path="/Visualizer" element={<Visualizer />} />
        <Route path="/VisualizerShare" element={<VisualizerShare />} />
        <Route path="/AdminVisualizer" element={<AdminVisualizer />} />
        <Route path="/BookConsultation" element={<BookConsultation />} />
        <Route path="/AdminConsultations" element={<AdminConsultations />} />
        <Route path="/AdminQuotes" element={<LayoutWrapper currentPageName="AdminQuotes"><AdminQuotes /></LayoutWrapper>} />
        <Route path="/QuoteView" element={<QuoteView />} />
        <Route path="/AdminNewQuote" element={<AdminNewQuote />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App