import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ShipmentDetailPage } from "./pages/ShipmentDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="shipments/:id" element={<ShipmentDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}