import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook'
import PlaceList from '../components/PlaceList';


const UserPlaces = () => {

  // get user name from route query
  const locationSearch = useLocation().search;
  const userName = locationSearch && locationSearch;

  // get user id from route path
  const userId = useParams().userId;

  // state to hold users places
  const [loadedPlaces, setLoadedPlaces] = useState();

  // use httpclient custom hook
  const { isLoading, sendRequest } = useHttpClient();

  // fetch users places from server
  useEffect(() => {
    let isActive = true;

    // decalre async function
    const fetchUserPlaces = async () => {
      try {
        // get data from server
        const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/places/user/${userId}`);

        // set users state
        if (isActive) setLoadedPlaces(responseData.places);

      } catch (err) { }// error handled inside the useHttpClient hook
    }

    // call the async function
    fetchUserPlaces();

    // clean up 
    return () => isActive = false;

  }, [sendRequest, userId])


  // function update the place list after deletion
  const onDeleteHandler = (deletedPlaceId) => {
    setLoadedPlaces(prevPlaces => prevPlaces.filter(place => place.id !== deletedPlaceId));
  }

  return <React.Fragment>
    {
      isLoading && <div className="center">
        <LoadingSpinner />
      </div>
    }
    {!isLoading && < PlaceList items={loadedPlaces} onDeletePlace={onDeleteHandler} requsetedUserId={userId} requsetedUserName={userName} />}
  </React.Fragment>
};

export default UserPlaces;
