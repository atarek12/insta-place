import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = props => {
  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" exact>
          ALL USERS
        </NavLink>
      </li>
      {auth.isLoggedIn && (   // only shown if user logged in
        <li>
          <NavLink to={`/${auth.userId}/places`}>MY PLACES</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (   // only shown if user logged in
        <li>
          <NavLink to={`/${auth.userId}/Add-Place/`}>ADD PLACE</NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (  // only shown if user logged out
        <li>
          <NavLink to="/auth">LOGIN</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (   // only shown if user logged in
        <li>
          <button onClick={auth.logout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
