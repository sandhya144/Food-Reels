import { BrowserRouter, Routes, Route } from 'react-router-dom';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/user/register"
          element={<h1>UserRegister</h1>}
        />

        <Route
          path="/user/login"
          element={<h1>UserLogin</h1>}
        />

        <Route
          path="/food-partner/register"
          element={<h1>FoodPartnerRegister</h1>}
        />

        <Route
          path="/food-partner/login"
          element={<h1>FoodPartnerLogin</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
