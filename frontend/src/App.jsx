import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { Boxes, LayoutDashboard, ReceiptText, Users } from "lucide-react";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Customers from "./pages/Customers.jsx";
import Orders from "./pages/Orders.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import "./styles.css";

function Shell() {
  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Boxes },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/orders", label: "Orders", icon: ReceiptText },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>InventoryOps</h1>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
