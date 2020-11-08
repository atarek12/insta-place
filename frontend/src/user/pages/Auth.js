import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook'
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';

const Auth = () => {

  // grap the auth context
  const auth = useContext(AuthContext);

  // use httpclient custom hook
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  // state to indicate starting request
  const [isStartRequest, setIsStartRequest] = useState(false)

  // state to manage switch mode from login to sign up and vice verca
  const [isLoginMode, setIsLoginMode] = useState(true);

  // manage our form with useForm custom hook
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false
      },
      password: {
        value: '',
        isValid: false
      }
    },
    false
  );

  // function to handle switching between two modes
  const switchModeHandler = () => {
    if (!isLoginMode) {
      // if in sign up mode and we are switching to log in mode
      setFormData(
        {
          ...formState.inputs,     // clone the data from sign up form
          name: undefined,         // clear the username as we dont use it in sign in
          image: undefined         // clear image as we dont use it in sign in
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid     // validate the form
      );
    } else {
      // if in log in mode and we are switching to sign up mode
      setFormData(
        {
          ...formState.inputs,    // clone the data from login form
          name: {
            value: '',            // set the inital value of user name
            isValid: false
          },
          image: {
            value: null,          // set the inital value of image file
            isValid: false
          }
        },
        false
      );
    }

    // perform the presentational switching
    setIsLoginMode(prevMode => !prevMode);
  };

  // handle submit button
  const authSubmitHandler = async event => {
    event.preventDefault();
    setIsStartRequest(true);

    if (isLoginMode) {
      // send data to server
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + '/api/users/login',
          'POST',
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value
          })
        );

        setIsStartRequest(false);


        //login
        auth.login(responseData.user.id, responseData.token);

      } catch (err) { } // error handled inside the useHttpClient hook

    } else {
      // signup
      try {
        const formData = new FormData();          // form data accept text data and binary data
        formData.append('email', formState.inputs.email.value);
        formData.append('name', formState.inputs.name.value);
        formData.append('password', formState.inputs.password.value);
        formData.append('image', formState.inputs.image.value);   // binary data
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + '/api/users/signup',
          'POST',
          undefined,
          formData
        );

        setIsStartRequest(false);

        //login
        auth.login(responseData.user.id, responseData.token);

      } catch (err) { } // error handled inside the useHttpClient hook
    };
  }
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && isStartRequest && <LoadingSpinner asOverlay />}
        <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a name."
              onInput={inputHandler}
            />
          )}
          {!isLoginMode && (
            <ImageUpload center id="image" onInput={inputHandler} errorText="Please provide an image" />
          )}
          <Input
            element="input"
            id="email"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password, at least 6 characters."
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
