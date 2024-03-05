import React from "react";

import Card from "../../Elements/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../Elements/components/FormElements/Button";

import "./PlaceList.css"

const PlaceList = props => {
    const places = props.items;

    if (places.length === 0) {
        return <div className="place- list center">
            <Card>
                <h2>No places found. May be create one?</h2>
                <Button to="/places/new">Share Place</Button>
            </Card>
        </div>
    }
    return <ul className="place-list">
        {places.map(place => {
            return <PlaceItem
                key={place.id}
                id={place.id}
                placeImage={place.image}
                title={place.title}
                description={place.description}
                address={place.address}
                creatorID={place.creator}
                coordinates={place.location}
                onDelete={props.onDeletePlace}
            />
        })}
    </ul>
}

export default PlaceList;