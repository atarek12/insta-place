import React, { useState, useContext } from 'react';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook'
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import { AuthContext } from '../../shared/context/auth-context';

import './PlaceItem.css';
import { useHistory } from 'react-router-dom';

const PlaceItem = props => {

  // grap the authContext
  const auth = useContext(AuthContext);

  // use history hook used to redirect our page
  const history = useHistory();

  // state to indicate starting request
  const [isStartRequest, setIsStartRequest] = useState(false)

  // use httpclient custom hook
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  // state to manage confirmation modal for deletion
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // handle delete button --> show warning
  const showDeleteWarningHandler = () => setShowConfirmModal(true);

  // handle cancel button in modal deletion
  const cancelDeleteHandler = () => setShowConfirmModal(false);

  // handle the delete operation
  const confirmDeleteHandler = async () => {
    setIsStartRequest(true);

    // delete the place from server
    try {
      // get data from server
      await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/places/${props.id}`, 'DELETE', { Authorization: 'Bearer ' + auth.token });

      // close modal
      setShowConfirmModal(false);

      // re-render place list page
      props.onDeletePlace(props.id);

      setIsStartRequest(false);

      // redirect to user places page
      history.goBack();

    } catch (err) { }// error handled inside the useHttpClient hook
  }


  // state to show modal for map
  const [showMap, setShowMap] = useState(false);

  // open the map modal
  const openMapHandler = () => setShowMap(true);

  // close the map modal
  const closeMapHandler = () => setShowMap(false);

  // display these two buttons in modal footer
  const footerProps = <div>
    <Button
      href={`http://www.google.com/maps/place/${props.coordinates.lat},${props.coordinates.lng}`}
      inverse
    >
      Open in Google Maps
    </Button>
    <Button onClick={closeMapHandler}>CLOSE</Button>
  </div>

  return (
    <React.Fragment>

      <ErrorModal error={error} onClear={clearError} />

      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={footerProps}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>

      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            {isLoading && isStartRequest && <LoadingSpinner asOverlay />}

            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to proceed and delete this place? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>


      <li className="place-item">
        <Card className="place-item__content">

          <div className="place-item__image">
            <img src={props.image} alt={props.title} />
          </div>

          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>

          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>VIEW ON MAP</Button>

            {auth.userId === props.creatorId && (     // only visable while user logged in
              <Button to={`/places/${props.id}`}>EDIT</Button>
            )}

            {auth.userId === props.creatorId && (     // only visable while user logged in
              <Button danger onClick={showDeleteWarningHandler}>
                DELETE
              </Button>
            )}
          </div>

        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
