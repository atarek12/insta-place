import React, { useRef, useState, useEffect } from 'react';

import Button from './Button';
import './ImageUpload.css';

const ImageUpload = props => {

  // state to hold file information
  const [file, setFile] = useState();

  // state to hold preview file
  const [previewUrl, setPreviewUrl] = useState();

  // state to manage if it is a valid file or not
  const [isValid, setIsValid] = useState(false);

  // to reference to a the file input element
  const filePickerRef = useRef();

  // if we had a file --> extract its URL
  useEffect(() => {
    if (!file) {
      // no file chosen
      return;
    }
    // else
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);       // it did not return a promise so we cannot use (.thern())
    fileReader.onload = () => {           // so here we wait untill finish it loading 
      setPreviewUrl(fileReader.result);   // then get file url from results
    };
  }, [file]);

  const pickedHandler = event => {
    let pickedFile;
    let fileIsValid = isValid;

    // if we have only one file
    if (event.target.files && event.target.files.length === 1) {
      // select the first file
      pickedFile = event.target.files[0];
      // update state
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;   // as the state will be schedueled untill changed -> take time
    }
    else {
      setIsValid(false);
      fileIsValid = false;
    }
    // call input handler in form hook
    props.onInput(props.id, pickedFile, fileIsValid);
  };

  // when button pressed --> open the file upload
  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  return (
    <div className="form-control">
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: 'none' }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && 'center'}`}>
        <div className="image-upload__preview" onClick={pickImageHandler}>
          {previewUrl && <img src={previewUrl} alt="Preview" />}
          {!previewUrl && <p>Please pick an image.</p>}
        </div>
        <Button type="button" onClick={pickImageHandler}>
          PICK IMAGE
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
