import { Outlet } from "react-router-dom"
import AppHeader from "@/components/layout/customers/customer.header"
import AppFooter from "./components/layout/customers/customer.footer"

function Layout() {

  return (
    <>
      <AppHeader  />
      <Outlet />
      <AppFooter /> 
    </>
  )
}

export default Layout
