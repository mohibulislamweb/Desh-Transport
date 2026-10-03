import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";

import { ToastHost } from "./components/Toast";

import { getAdminToken, getDriverToken, getDriver } from "./config";


import LandingPage from "./LandingPage";

import AuthPage from "./AuthPage";

import TripList from "./TripList";

import DriverDashboard from "./DriverDashboard";

import AdminDashboard from "./AdminDashboard";

import AdminLogin from "./AdminLogin";





// 🛡️ লগইন ছাড়া ড্যাশবোর্ডে ঢোকা যাবে না
const RequireAdmin=({children})=>(
getAdminToken() ? children : <Navigate to="/admin-login" replace />
);

const RequireDriver=({children})=>(
getDriverToken() && getDriver() ? children : <Navigate to="/login" replace />
);




function App(){


return(

<>

<ToastHost />

<Routes>




<Route

path="/"

element={<LandingPage />}

/>






<Route

path="/login"

element={<AuthPage />}

/>







<Route

path="/trips"

element={<TripList />}

/>







<Route

path="/driver"

element={<RequireDriver><DriverDashboard /></RequireDriver>}

/>








<Route

path="/admin-login"

element={<AdminLogin />}

/>








<Route

path="/admin"

element={<RequireAdmin><AdminDashboard /></RequireAdmin>}

/>






<Route

path="*"

element={<Navigate to="/" replace />}

/>



</Routes>

</>


);


}



export default App;