import React, { useState, useCallback, useEffect, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  useHistory
} from 'react-router-dom';

import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

// code spliting
const Users = React.lazy(() => import('./user/pages/Users'));
const NewPlace = React.lazy(() => import('./places/pages/NewPlace'));
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'));
const Auth = React.lazy(() => import('./user/pages/Auth'));

let logoutTimer;

const App = () => {
  // token state
  const [token, setToken] = useState(null);

  // user id state
  const [userId, setUserId] = useState(null);

  // Token Expiration Date state
  const [tokenExpirationDate, setTokenExpirationDate] = useState();

  // handle login
  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    const newExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60); // old expire date || now + 1 hour
    setTokenExpirationDate(newExpirationDate);
    localStorage.setItem('userData', JSON.stringify({ userId: uid, token: token, expiration: newExpirationDate.toISOString() }));
  }, []);

  // use history hook used to redirect our page
  const history = useHistory();

  // handle logout
  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExpirationDate(null);
    localStorage.removeItem('userData');
    history.push('/');
  }, [history]);

  // on mounting -> extract login if user has a token in local storage
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
      login(storedData.userId, storedData.token);
    }
  }, [login])

  // start timer to auto logout
  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remaingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remaingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate])

  let routes;

  if (token) {
    // define the routes that available while logged in
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces matchh="hghg" />
        </Route>
        <Route path="/:userId/Add-Place/" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    // define the routes that available while logged out
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    // wrap everything in provider for the auth context
    <AuthContext.Provider
      value={{ isLoggedIn: !!token, token: token, userId: userId, login: login, logout: logout }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Suspense fallback={
            <div className="center">
              <LoadingSpinner />
            </div>
          }>
            {routes}
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
