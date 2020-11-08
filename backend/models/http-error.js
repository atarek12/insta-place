class HttpError extends Error {
  constructor(message, errorCode) {
    super(message);                     // Add a "message" property
    this.code = errorCode;              // Adds a "code" property
  }
}

module.exports = HttpError;



// a simple class that create an error object with a message and error code