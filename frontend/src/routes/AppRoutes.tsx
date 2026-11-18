import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from '../pages/auth/AuthPage';
import Home from '../pages/general/Home';
import Profile from '../pages/food-partner/Profile';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user/register" element={<AuthPage role="user" mode="register" />} />
        <Route path="/user/login" element={<AuthPage role="user" mode="login" />} />
        <Route path="/food-partner/register" element={<AuthPage role="partner" mode="register" />} />
        <Route path="/food-partner/login" element={<AuthPage role="partner" mode="login" />} />
        <Route path="/" element={<Home />} />
        <Route path="/create-food" element={<div>Create Food</div>} />
        <Route path="/food-partner/:profileId" element={<Profile />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
