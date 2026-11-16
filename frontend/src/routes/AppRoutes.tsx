import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user/register" element={<AuthPage role="user" mode="register" />} />
        <Route path="/user/login" element={<AuthPage role="user" mode="login" />} />
        <Route path="/food-partner/register" element={<AuthPage role="partner" mode="register" />} />
        <Route path="/food-partner/login" element={<AuthPage role="partner" mode="login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
