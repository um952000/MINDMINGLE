// import React from "react";
// import { Outlet } from "react-router-dom";
// import Header from "./components/Header/Header";
// import Footer from "./components/Footer/Footer";
// import './index.css'
// import { useAuth } from "./hooks/useAuth.jsx";
// import { AuthProvider } from "./hooks/useAuth"

// function Layout() {
//     return (
//         <>
//             <AuthProvider>
//                 <Header />
//                 <Outlet />
//                 {/* <Footer /> */}
//             </AuthProvider>
//         </>
//     );
// }

// export default Layout;



import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import './index.css'
import { AuthProvider } from "./hooks/useAuth"
import Navbar from "./components/Header/Header";  // ✅ adjust path to your Navbar

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <AuthProvider>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Outlet />
        </AuthProvider>
    );
}

export default Layout;