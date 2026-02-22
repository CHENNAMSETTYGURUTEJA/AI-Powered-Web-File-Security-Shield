import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UrlScanner } from './pages/UrlScanner';
import { FileScanner } from './pages/FileScanner';
import { ThreatLogs } from './pages/ThreatLogs';
import { ExtensionPanel } from './pages/ExtensionPanel';
import { ModelAnalytics } from './pages/ModelAnalytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="url-scanner" element={<UrlScanner />} />
          <Route path="file-scanner" element={<FileScanner />} />
          <Route path="logs" element={<ThreatLogs />} />
          <Route path="extension" element={<ExtensionPanel />} />
          <Route path="analytics" element={<ModelAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
