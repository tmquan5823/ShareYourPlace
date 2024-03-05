import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom/cjs/react-router-dom.min";

import Input from "../../Elements/components/FormElements/Input";
import Button from "../../Elements/components/FormElements/Button";
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from '../../Elements/util/validators';
import { useForm } from "../../Elements/Hooks/form-hooks";
import ErrorModal from "../../Elements/components/UIElements/ErrorModal";
import LoadingSpinner from "../../Elements/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../Elements/Hooks/http-hook";
import { AuthContext } from "../../Elements/Context/auth-context";

import "./PlaceForm.css";

const UpdatePlace = props => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    // const [loadingState, setLoadingState] = useState(true);
    const [loadedPlace, setLoadedPlace] = useState();
    const placeID = useParams().placeID;
    const history = useHistory();


    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: "",
            isValid: false
        },
        description: {
            value: "",
            isValid: false
        },
        address: {
            value: "",
            isValid: false
        }
    }, false)

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const responseData = await sendRequest(
                    `http://localhost:5000/api/places/${placeID}`
                );
                setLoadedPlace(responseData.place);
                setFormData(
                    {
                        title: {
                            value: responseData.place.title,
                            isValid: true
                        },
                        description: {
                            value: responseData.place.description,
                            isValid: true
                        }
                    },
                    true
                );

            } catch (err) { }
        };
        fetchPlace();
    }, [sendRequest, placeID, setFormData]);


    async function placeUpdateSubmitHandler(event) {
        event.preventDefault();
        try {
            await sendRequest(`http://localhost:5000/api/places/${placeID}`,
                "PATCH",
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value,
                }),
                {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + auth.token
                }
            );
            history.push("/" + auth.userID + "/places");
        } catch (err) {

        }
        console.log(formState.inputs);
    }

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner />
            </div>
        )
    }

    if (!loadedPlace && !error) {
        return <div className="center"><h2>Could not find place!</h2></div>
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {!isLoading && loadedPlace && <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
                <Input
                    id="title"
                    type="text"
                    element="input"
                    label="Title"
                    errorText="Please enter a valid title!"
                    validators={[VALIDATOR_REQUIRE()]}
                    onInput={inputHandler}
                    initialValue={loadedPlace.title}
                    initialIsValid={true} />
                <Input
                    id="description"
                    type="text"
                    label="Description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please enter a valid description (at least 5 characters)."
                    onInput={inputHandler}
                    initialValue={loadedPlace.description}
                    initialIsValid={true} />
                <Button type="submit" disabled={!formState.isValid}>UPDATE PLACE</Button>
            </form>}
        </React.Fragment>
    );
};

export default UpdatePlace;  