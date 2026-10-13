import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('CivicConnect render error:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#001e22', color: '#e8f5f7', padding: '48px 24px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h1 style={{ color: '#fca5a5' }}>CivicConnect could not render</h1>
            <p style={{ marginTop: 16, lineHeight: 1.6 }}>The website loaded, but a frontend component crashed. This diagnostic message helps identify the problem.</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', marginTop: 20, padding: 20, background: '#062d31', border: '1px solid #6ab5c0', borderRadius: 12 }}>{String(this.state.error?.stack || this.state.error?.message || this.state.error)}</pre>
            <p style={{ marginTop: 16 }}>Refresh once. If this message remains, share a screenshot of this error.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(container).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
