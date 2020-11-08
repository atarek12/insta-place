import React, { useReducer, useEffect } from 'react';

import { validate } from '../../util/validators';
import './Input.css';

const inputReducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE':
      return {
        ...state,                                           // clone the old state
        value: action.val,                                  // change its value
        isValid: validate(action.val, action.validators)    // validate it
      };
    case 'TOUCH': {
      return {
        ...state,
        isTouched: true       // so we can handle the warning
      }
    }
    default:
      return state;
  }
};

const Input = props => {

  // reducer used here to manage the complex relation of the input value and its validator
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || '',
    isTouched: false,
    isValid: props.initialValid || false
  });

  // destruct the props
  const { id, onInput } = props;

  // destruct the input state
  const { value, isValid } = inputState;

  // on mounting --> call the onInput function --> inputHandler --> which handle the state of an input (value,isValid)
  useEffect(() => {
    onInput(id, value, isValid)
  }, [id, value, isValid, onInput]);

  // handle on change
  const changeHandler = event => {
    // dispath an action to the inputReducer
    dispatch({
      type: 'CHANGE',
      val: event.target.value,
      validators: props.validators
    });
  };

  // handle on blur --> if focused and then blured
  const touchHandler = () => {
    dispatch({
      type: 'TOUCH'
    });
  };

  // render diffrent types of input element
  const element =
    props.element === 'input' ? (
      <input
        id={props.id}
        type={props.type}
        placeholder={props.placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    ) : (
        <textarea
          id={props.id}
          rows={props.rows || 3}
          onChange={changeHandler}
          onBlur={touchHandler}
          value={inputState.value}
        />
      );

  return (
    <div
      className={`form-control ${!inputState.isValid && inputState.isTouched &&
        'form-control--invalid'}`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      {element}
      {!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
    </div>
  );
};

export default Input;
