import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

import PlaceList from "../../places/components/PlaceList";
import ErrorModal from "../../Elements/components/UIElements/ErrorModal";
import LoadingSpinner from "../../Elements/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../Elements/Hooks/http-hook";

const UserPlaces = props => {
    const [places, setPlaces] = useState([]);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const userID = useParams().userID;
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const responseData = await sendRequest("http://localhost:5000/api/places/user/" + userID);
                setPlaces(responseData.places);
                console.log(responseData.places);
            }
            catch (err) {

            };
        };
        fetchPlaces();
    }, [sendRequest, userID]);

    const placeDeleteHandler = (deletedPlaceID) => {
        setPlaces(prePlaces => prePlaces.filter(place => place.id !== deletedPlaceID));
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && places && < PlaceList items={places} onDeletePlace={placeDeleteHandler} />}
        </React.Fragment>
    );
};

export default UserPlaces;