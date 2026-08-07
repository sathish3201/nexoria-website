import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { totalCount } = useCart();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="nav-logo">
          Trailhead<span>Goods</span>
        </NavLink>

        <nav className="nav-links" style={{ display: "flex" }}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Shop
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            Admin
          </NavLink>
        </nav>

        <div className="nav-cta">
          <NavLink to="/cart" className="btn btn-primary">
            Cart{totalCount > 0 ? ` (${totalCount})` : ""}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
