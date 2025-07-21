import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavGeral.css";

export const NavGeral = () => {
  const detailsRefs = useRef([]);
  const location = useLocation();

  useEffect(() => {
    detailsRefs.current.forEach((details) => {
      if (details) details.removeAttribute("open");
    });
  }, [location]);

  return (
    <nav className="nav">
      <ul className="nav-ul">
        <li className="nav-li">
          <Link className="nav-a" to="/">
            Home
          </Link>
        </li>
        <li className="nav-li">
          <Link className="nav-a" to="/Gerenciamento/HomeGerenciamento">
            Gerenciamento
          </Link>
        </li>
        <li className="nav-li">
          <Link className="nav-a" to="/Caixa/HomeCaixa">
            Caixa
          </Link>
        </li>

      </ul>
    </nav>
  );
};