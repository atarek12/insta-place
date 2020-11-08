import React, { useContext, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook'
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { AuthContext } from '../../shared/context/auth-context';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import './PlaceForm.css';

const NewPlace = () => {

  // get the context
  const auth = useContext(AuthContext);

  // get user id from route path
  const userId = useParams().userId;

  // use history hook used to redirect our page
  const history = useHistory();

  // use httpclient custom hook
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  // state to indicate starting request
  const [isStartRequest, setIsStartRequest] = useState(false)

  // custom hook to handle form inputs states using its inside inputHandler function and take initial state
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      address: {
        value: '',
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );

  // handle submit button
  const placeSubmitHandler = async event => {
    event.preventDefault();
    setIsStartRequest(true);

    // send this place to the server
    try {
      const formData = new FormData();          // form data accept text data and binary data
      formData.append('title', formState.inputs.title.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('address', formState.inputs.address.value);
      formData.append('creator', userId);
      formData.append('image', formState.inputs.image.value);   // binary data
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + '/api/places',
        'POST',
        { Authorization: 'Bearer ' + auth.token },
        formData
      );

      setIsStartRequest(false);

      // redirect to user places page
      history.replace(`/${userId}/places`);

    } catch (err) { } // error handled inside the useHttpClient hook
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />

      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && isStartRequest && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
        />

        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)."
          onInput={inputHandler}
        />

        <Input
          id="address"
          element="input"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address."
          onInput={inputHandler}
        />

        <ImageUpload id="image" onInput={inputHandler} errorText="Please provide an image" />

        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
      </Button>

      </form>
    </React.Fragment>
  );
};

export default NewPlace;
