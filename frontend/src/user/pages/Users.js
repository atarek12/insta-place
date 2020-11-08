import React, { useState, useEffect } from 'react';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { useHttpClient } from '../../shared/hooks/http-hook'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import UsersList from '../components/UsersList';

const Users = () => {

  // use httpclient custom hook
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  // state to hold users data
  const [loadedUsers, setLoadedUsers] = useState();

  // fetch users from server
  useEffect(() => {
    let isActive = true;

    // decalre async function
    const fetchUsers = async () => {
      try {
        // get data from server
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/api/users');

        // set users state
        if (isActive) setLoadedUsers(responseData.users);

      } catch (err) { }// error handled inside the useHttpClient hook
    }

    // call the async function
    fetchUsers();

    // clean up 
    return () => isActive = false;

  }, [sendRequest])


  return <React.Fragment>
    <ErrorModal error={error} onClear={clearError} />
    {
      isLoading && <div className="center">
        <LoadingSpinner />
      </div>
    }
    {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
  </React.Fragment>;
};

export default Users;
