import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import './index.css'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'
import Layout from "./Layout"
import { AuthProvider } from "./hooks/useAuth"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AskDoubt from "./pages/AskDoubt"
import Profile from "./pages/UserProfile"

import Home from "./pages/Home"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="ask" element={<AskDoubt />} />
      <Route path="profile/:id" element={<Profile />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

// main.jsx - temporary debug, add before ReactDOM.render
const originalConsoleError = console.error
console.error = (...args) => {
  if (args[0]?.includes?.('Objects are not valid')) {
    console.trace('Object rendered as child - stack trace:')
  }
  originalConsoleError(...args)
}