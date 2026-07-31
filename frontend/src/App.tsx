import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./features/dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;