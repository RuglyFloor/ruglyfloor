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
import CampPromo from './pages/CampPromo';
import AccountSettings from './pages/AccountSettings';
import AdminBuilderAnalytics from './pages/AdminBuilderAnalytics';
import React, { Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
      <AnimatePresence mode="wait">
        <motion.div
          key="route"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
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
            <Route path="/promo" element={<CampPromo />} />
            <Route path="/AccountSettings" element={<LayoutWrapper currentPageName="AccountSettings"><AccountSettings /></LayoutWrapper>} />
            <Route path="/AdminBuilderAnalytics" element={<LayoutWrapper currentPageName="AdminBuilderAnalytics"><AdminBuilderAnalytics /></LayoutWrapper>} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
};

function App() {
  // Dark mode preference
  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AnimatePresence mode="wait">
            <AuthenticatedApp />
          </AnimatePresence>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App