import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import {
  AuthProvider,
} from "./features/auth/AuthContext";

import Login from "./features/auth/Login";

import ProtectedRoute from "./features/auth/ProtectedRoute";

import Dashboard from "./features/dashboard/Dashboard";

/* Patients */

import AddPatient from "./features/patients/AddPatient";
import EditPatient from "./features/patients/EditPatient";
import PatientProfile from "./features/patients/PatientProfile";
import Patients from "./features/patients/Patients";

/* Appointments */

import AddAppointment from "./features/appointments/AddAppointment";
import Appointments from "./features/appointments/Appointments";
import AppointmentDetails from "./features/appointments/AppointmentDetails";

/* Visits */

import Consultation from "./features/visits/Consultation";
import VisitDetails from "./features/visits/VisitDetails";
import Visits from "./features/visits/Visits";

/* Prescription */

import Prescription from "./features/prescriptions/Prescription";

/* Billing */

import BillDetails from "./features/billing/BillDetails";
import Billing from "./features/billing/Billing";
import CreateBill from "./features/billing/CreateBill";

/* Payments */

import Payments from "./features/payments/Payments";
import Receipt from "./features/payments/Receipt";
import RecordPayment from "./features/payments/RecordPayment";

/* Reports */

import Reports from "./features/reports/Reports";

/* Settings */

import Settings from "./features/settings/Settings";

/* 404 */

import NotFound from "./features/not-found/NotFound";


function ProtectedApp() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard />
            }
          />

          {/* Patients */}

          <Route
            path="/patients"
            element={<Patients />}
          />

          <Route
            path="/patients/add"
            element={<AddPatient />}
          />

          <Route
            path="/patients/:patientId"
            element={
              <PatientProfile />
            }
          />

          <Route
            path="/patients/:patientId/edit"
            element={
              <EditPatient />
            }
          />

          {/* Appointments */}

          <Route
            path="/appointments"
            element={
              <Appointments />
            }
          />

          <Route
            path="/appointments/add"
            element={
              <AddAppointment />
            }
          />

          <Route
            path="/appointments/:appointmentId"
            element={
              <AppointmentDetails />
            }
          />

          {/* Visits */}

          <Route
            path="/visits"
            element={<Visits />}
          />

          <Route
            path="/visits/new"
            element={
              <Consultation />
            }
          />

          <Route
            path="/visits/:visitId/consultation"
            element={
              <Consultation />
            }
          />

          <Route
            path="/visits/:visitId"
            element={
              <VisitDetails />
            }
          />

          {/* Prescription */}

          <Route
            path="/prescriptions/:visitId"
            element={
              <Prescription />
            }
          />

          {/* Billing */}

          <Route
            path="/billing"
            element={<Billing />}
          />

          <Route
            path="/billing/new"
            element={<CreateBill />}
          />

          <Route
            path="/billing/:billId"
            element={
              <BillDetails />
            }
          />

          {/* Payments */}

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/payments/new"
            element={
              <RecordPayment />
            }
          />

          <Route
            path="/payments/:paymentId/receipt"
            element={<Receipt />}
          />

          {/* Reports */}

          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* Settings */}

          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* 404 */}

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/*"
            element={
              <ProtectedApp />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;