import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook'
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import { AuthContext } from '../../shared/context/auth-context';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import './PlaceForm.css';


const UpdatePlace = () => {

  // grap the authContext
  const auth = useContext(AuthContext);

  // get the palce id from the route path
  const placeId = useParams().placeId;

  // use history hook used to redirect our page
  const history = useHistory();

  // state to hold users places
  const [loadedPlace, setLoadedPlace] = useState();

  // use httpclient custom hook
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  // custom hook to handle form inputs states using its inside inputHandler function and take initial state
  // set form data is used to set the default values of the form
  const [formState, inputHandler, setFormData] = useForm(
    {// initial state
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      }
    },
    false
  );

  // fetch this palce from server
  useEffect(() => {
    let isActive = true;

    if (isActive) {
      // decalre async function
      const fetchUserPlace = async () => {
        try {
          // get data from server
          const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`);

          // set default value in the form
          setFormData(
            {
              title: {
                value: responseData.place.title,
                isValid: true
              },
              description: {
                value: responseData.place.description,
                isValid: true
              }
            },
            true
          );

          // set users state
          setLoadedPlace(responseData.place);
        } catch (err) { }// error handled inside the useHttpClient hook
      }

      // call the async function
      fetchUserPlace();
    }

    // clean up 
    return () => {
      isActive = false;
    }
  }, [sendRequest, placeId, setFormData])


  // handle submit button
  const placeUpdateSubmitHandler = async event => {
    event.preventDefault();

    // send this place to the server
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`,
        'PATCH',
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token
        },
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value
        }))

      // redirect to user places page
      history.replace(`/${auth.userId}/places`);

    } catch (err) { } // error handled inside the useHttpClient hook  
    // updata place in the server
  };

  // if we dont have places to update
  if (!loadedPlace && !error) return <div ></div>

  // show the spinner
  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  return <React.Fragment>
    <ErrorModal error={error} onClear={clearError} />
    <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
      <Input
        id="title"
        element="input"
        type="text"
        label="Title"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title."
        onInput={inputHandler}
        initialValue={formState.inputs.title.value}
        initialValid={formState.inputs.title.isValid}
      />
      <Input
        id="description"
        element="textarea"
        label="Description"
        validators={[VALIDATOR_MINLENGTH(5)]}
        errorText="Please enter a valid description (min. 5 characters)."
        onInput={inputHandler}
        initialValue={formState.inputs.description.value}
        initialValid={formState.inputs.description.isValid}
      />
      <Button type="submit" disabled={!formState.isValid}>
        UPDATE PLACE
      </Button>
    </form>
  </React.Fragment>;
};

export default UpdatePlace;
