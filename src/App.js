import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './styles/App.css';

// Layout Components
import Layout from './components/layout/Layout';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Page Components
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import Guests from './pages/Guests';
import Tickets from './pages/Tickets';
import Events from './pages/Events';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Inventory from './pages/Inventory';

// Auth Components
import PrivateRoute from './components/auth/PrivateRoute';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Sidebar />
                  <div className="main-content">
                    <Header />
                    <Dashboard />
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/reservations" element={
              <PrivateRoute>
                <Layout>
                  <Sidebar />
                  <div className="main-content">
                    <Header />
                    <Reservations />
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/guests" element={
              <PrivateRoute>
                <Layout>
                  <Sidebar />
                  <div className="main-content">
                    <Header />
                    <Guests />
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/tickets" element={
              <PrivateRoute>
                <Layout>
                  <Sidebar />
                  <div className="main-content">
                    <Header />
                    <Tickets />
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/events" element={
              <PrivateRoute>
                <Layout>
                  <Sidebar />
                  <div className="main-content">
                    <Header />
                    <Events />
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/inventory" element={
              <PrivateRoute>
                <Layout>
                  <Sidebar />
                  <div className="main-content">
                    <Header />
                    <Inventory />
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/reports" element={
              <PrivateRoute>
                <Layout>
                  <Sidebar />
                  <div className="main-content">
                    <Header />
                    <Reports />
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Layout>
                  <Sidebar />
                  <div className="main-content">
                    <Header />
                    <Settings />
                  </div>
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;