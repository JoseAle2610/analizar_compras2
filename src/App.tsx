import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { Dashboard, RoundDetail, ProductsPage, EstablishmentsPage, SettingsPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rounds/:id" element={<RoundDetail />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/establishments" element={<EstablishmentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
