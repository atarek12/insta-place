import React, { useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import PlaceItem from './PlaceItem';
import { AuthContext } from '../../shared/context/auth-context';
import './PlaceList.css';

const PlaceList = props => {
  // get the context
  const auth = useContext(AuthContext);

  // get resquested user name
  const name = props.requsetedUserName.slice(1);

  // if user has no places
  if (!props.items || props.items.length === 0) {
    // if cleint request his own profile
    const isHisProfile = props.requsetedUserId === auth.userId;

    return (
      <div className="place-list center">
        <Card>
          <h2>{isHisProfile ? `Hi ${name}, you dont have places yet. Maybe create one?` : `${name} has no places yet.`}</h2>
          {isHisProfile && <Button to={`/${auth.userId}/Add-Place/`} >Share Place</Button>}
        </Card>
      </div>
    );
  }

  // else 
  return (
    <ul className="place-list">
      {props.items.map(place => (
        <PlaceItem
          key={place.id}
          id={place.id}
          image={place.image}
          title={place.title}
          description={place.description}
          address={place.address}
          creatorId={place.creator}
          coordinates={place.location}
          onDeletePlace={props.onDeletePlace}
          name={name}
        />
      ))}
    </ul>
  );
};

export default PlaceList;


// presentational state