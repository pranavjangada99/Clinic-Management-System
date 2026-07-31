import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./features/dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;