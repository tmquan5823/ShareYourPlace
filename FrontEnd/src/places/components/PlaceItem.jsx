import React, { useState, useContext } from "react";

import Card from "../../Elements/components/UIElements/Card";
import Button from "../../Elements/components/FormElements/Button";
import Modal from "../../Elements/components/UIElements/Modal"
import Map from "../../Elements/components/UIElements/Map";
import ErrorModal from "../../Elements/components/UIElements/ErrorModal";
import LoadingSpinner from "../../Elements/components/UIElements/LoadingSpinner";
import { AuthContext } from "../../Elements/Context/auth-context";
import { useHttpClient } from "../../Elements/Hooks/http-hook";

import "./PlaceItem.css"

const PlaceItem = props => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const auth = useContext(AuthContext);
    const [showMap, setShowMap] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    function openMapHandler() {
        setShowMap(true);
    }

    function closeMapHandler() {
        setShowMap(false);
    }

    function showDeleteModalHandler() {
        setShowDeleteModal(true)
    }

    function cancelDeleteHandler() {
        setShowDeleteModal(false)
    }

    async function confirmDeleteHandler() {
        setShowDeleteModal(false);
        try {
            await sendRequest(`http://localhost:5000/api/places/${props.id}`, 'DELETE', null,
                {
                    Authorization: "Bearer " + auth.token
                });
            props.onDelete(props.id);
        }
        catch (err) { }
    }

    return (<React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
        <Modal
            show={showMap}
            onCancel={closeMapHandler}
            header={props.address}
            contentClass="place-item__modal-content"
            footerClass="place-item__modal-actions"
            footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
        >
            <div class="map-container">
                <Map center={props.coordinates} zoom={16} />
            </div>
        </Modal>
        <Modal
            show={showDeleteModal}
            onCancel={cancelDeleteHandler}
            header="DELETE PLACE"
            footerClass="place-item__modal-actions"
            footer={<React.Fragment>
                <Button inverse onClick={cancelDeleteHandler}>Cancel</Button>
                <Button danger onClick={confirmDeleteHandler}>Delete</Button>
            </React.Fragment>}>
            Do you want to delete this place?
        </Modal>
        <li className="place-item">
            <Card className="place-item__content">
                {isLoading && <LoadingSpinner asOverlay />}
                <div className="place-item__image">
                    <img src={"http://localhost:5000/" + props.placeImage} alt={props.title} />
                </div>
                <div className="place-item__info">
                    <h2>{props.title}</h2>
                    <h3>{props.address}</h3>
                    <p>{props.description}</p>
                </div>
                <div className="place-item__actions">
                    <Button inverse onClick={openMapHandler}>VIEW ON MAP</Button>
                    {auth.userID === props.creatorID && <Button to={`/places/${props.id}`}>EDIT</Button>}
                    {auth.userID === props.creatorID && <Button danger onClick={showDeleteModalHandler}>DELETE</Button>}
                </div>
            </Card>
        </li>
    </React.Fragment>)
}

export default PlaceItem;