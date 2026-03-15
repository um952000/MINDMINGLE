import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import './index.css'
import { useAuth } from "./hooks/useAuth.jsx";
import { AuthProvider } from "./hooks/useAuth"

function Layout() {
    return (
        <>
            <AuthProvider>
                <Header />
                <Outlet />
                {/* <Footer /> */}
            </AuthProvider>
        </>
    );
}

export default Layout;