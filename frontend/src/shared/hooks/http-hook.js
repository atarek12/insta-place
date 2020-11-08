import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {

  // state to manage spinner
  const [isLoading, setIsLoading] = useState(true);

  // state to manage error msg
  const [error, setError] = useState();

  // state used to cancel fetch request
  const activeHttpRequests = useRef([]);

  // send request function 
  const sendRequest = useCallback(async (url, method = 'GET', headers = {}, body = null) => {
    // show spinner
    setIsLoading(true);

    // initialize the abort controller to cancel fetch request
    const httpAbortCtrl = new AbortController();
    activeHttpRequests.current.push(httpAbortCtrl);

    try {
      // send data to server
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: httpAbortCtrl.signal
      });
      const responseData = await response.json();

      // if http aported --> clear it from the array
      activeHttpRequests.current = activeHttpRequests.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl);

      // if error occured in backend
      if (!response.ok) throw new Error(responseData.message);     // 4** & 5**

      // stop spinner
      setIsLoading(false);

      // return our response data
      return responseData;

    } catch (err) {
      // stop spinner
      setIsLoading(false);

      // change error state
      setError(err.message || 'Something went wrong, please try again.');

      // throw an error to the calling component
      throw err;
    }
  }, [])

  // clean up
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
    }
  }, [])

  // handle error --> clear it
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // return
  return { isLoading, error, sendRequest, clearError };
}