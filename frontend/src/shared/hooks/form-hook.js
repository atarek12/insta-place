import { useCallback, useReducer } from 'react';

const formReducer = (state, action) => {
  switch (action.type) {
    case 'INPUT_CHANGE':

      // initially the form is valid
      let formIsValid = true;

      // loop in all our form inputs that in the state
      for (const inputId in state.inputs) {

        // if we dont have an input
        if (!state.inputs[inputId]) {
          // skip this iteration
          continue;
        }
        // if we are in this input --> update form validation
        if (inputId === action.inputId) {
          formIsValid = formIsValid && action.isValid;
        }
        // if we are in another input --> update form validation
        else {
          formIsValid = formIsValid && state.inputs[inputId].isValid;
        }
      }
      return {
        ...state,               // clone root state (inputs , isValid)
        inputs: {
          ...state.inputs,      // clone each input state ( value , isValid)
          [action.inputId]: { value: action.value, isValid: action.isValid }
        },
        isValid: formIsValid
      };
    case 'SET_DATA':
      return {
        inputs: action.inputs,
        isValid: action.formIsValid
      };
    default:
      return state;
  }
};

export const useForm = (initialInputs, initialFormValidity) => {

  // use reducer to manage complex realation between all form inputs and form validation
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    isValid: initialFormValidity
  });

  // handler for all inputs --> updata this input state
  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({
      type: 'INPUT_CHANGE',
      value: value,
      isValid: isValid,
      inputId: id
    });
  }, []);     // no dependencies while using dispatch --> react do it manually

  // set the old data to the form inputs intial values --> set the initial state of the form
  const setFormData = useCallback((inputData, formValidity) => {
    dispatch({
      type: 'SET_DATA',
      inputs: inputData,
      formIsValid: formValidity
    });
  }, []);

  // formState hold the updated state
  return [formState, inputHandler, setFormData];
};