import React, { useCallback, useState } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import MainNavigation from './Elements/components/Navigation/MainNavigation';
import Users from "./user/pages/Users";
import AddPlace from './places/pages/AddPlace';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';
import { AuthContext } from './Elements/Context/auth-context';



function App() {
  const [isLoggedIn, setLoginState] = useState(false);
  const [token, setToken] = useState(null);
  const [userID, setUserID] = useState(null);

  const login = useCallback((uid, token) => {
    setLoginState(true);
    setUserID(uid);
    setToken(token);
  }, [])

  const logout = useCallback(() => {
    setLoginState(false);
    setUserID(null);
    setToken(null);
  }, [])

  let routes;

  if (token) {
    routes = (<Switch>
      <Route path="/" exact>
        <Users />
      </Route>
      <Route path="/:userID/places">
        <UserPlaces />
      </Route>
      <Route path="/places/new" exact>
        <AddPlace />
      </Route>
      <Route path="/places/:placeID" exact>
        <UpdatePlace />
      </Route>
      <Redirect to="/" />
    </Switch>)
  } else {
    routes = (<Switch>
      <Route path="/" exact>
        <Users />
      </Route>
      <Route path="/:userID/places" exact>
        <UserPlaces />
      </Route>
      <Route path="/auth" exact>
        <Auth />
      </Route>
      <Redirect to="/auth" />
    </Switch>)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, userID: userID, token: token, login: login, logout: logout }}>
      <BrowserRouter>
        <MainNavigation />
        <main>
          {routes}
        </main>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
