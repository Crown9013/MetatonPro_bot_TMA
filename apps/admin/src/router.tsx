import React from "react"

import { RouteObject } from "react-router-dom"

import AuthenticatedRoute from "./components/_routes/AuthenticatedRoute"

import Home from "./pages/home"
import Users from "./pages/users"
import Robots from "./pages/robots"
import Weapons from "./pages/weapons"
import Login from "./pages/auth/login"
import Dashboard from "./pages/dashboard"
import AccountSettings from "./pages/account-settings"
import Tasks from "./pages/tasks"
import { DetailedRobot } from "./pages/robots/components/DetailedRobot"

const router: RouteObject[] = [
  {
    path: "/",
    element: <Home />
  },

  /**
   * ----------------------------------------------------------------
   * Unauthenticated Routes
   * ----------------------------------------------------------------
   */
  {
    path: "login",
    element: <Login />
  },

  /**
   * ----------------------------------------------------------------
   * Authenticated Routes
   * ----------------------------------------------------------------
   */
  {
    path: "account-settings",
    element: (
      <AuthenticatedRoute>
        <AccountSettings />
      </AuthenticatedRoute>
    )
  },
  {
    path: "dashboard",
    element: (
      <AuthenticatedRoute>
        <Dashboard />
      </AuthenticatedRoute>
    )
  },
  {
    path: "users",
    element: (
      <AuthenticatedRoute>
        <Users />
      </AuthenticatedRoute>
    )
  },
  {
    path: "robots",
    element: (
      <AuthenticatedRoute>
        <Robots />
      </AuthenticatedRoute>
    )
  },
  {
    path: "robots/:id",
    element: (
      <AuthenticatedRoute>
        <DetailedRobot />
      </AuthenticatedRoute>
    )
  },
  {
    path: "weapons",
    element: (
      <AuthenticatedRoute>
        <Weapons />
      </AuthenticatedRoute>
    )
  },
  {
    path: "tasks",
    element: (
      <AuthenticatedRoute>
        <Tasks />
      </AuthenticatedRoute>
    )
  }
]

export default router
