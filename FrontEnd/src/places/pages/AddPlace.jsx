import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from '../../Elements/util/validators';
import Input from '../../Elements/components/FormElements/Input';
import Button from "../../Elements/components/FormElements/Button";
import ImageUpload from '../../Elements/components/FormElements/ImageUpload';
import { useForm } from '../../Elements/Hooks/form-hooks';
import { useHttpClient } from '../../Elements/Hooks/http-hook';
import { AuthContext } from '../../Elements/Context/auth-context';
import ErrorModal from '../../Elements/components/UIElements/ErrorModal';
import LoadingSpinner from '../../Elements/components/UIElements/LoadingSpinner';

import "./PlaceForm.css";

const AddPlace = props => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [formState, inputHandler] = useForm({
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
        },
        image: {
            value: null,
            isValid: false
        }
    }, false)

    const history = useHistory();

    async function addPlaceSubmitHandler(event) {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', formState.inputs.title.value);
            formData.append('description', formState.inputs.description.value);
            formData.append('address', formState.inputs.address.value);
            formData.append('creator', auth.userID);
            formData.append('image', formState.inputs.image.value);
            await sendRequest("http://localhost:5000/api/places", "POST", formData, { Authorization: "Bearer " + auth.token });
            history.push("/");
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <form className='place-form' onSubmit={addPlaceSubmitHandler}>
                {isLoading && <LoadingSpinner asOverlay />}
                <Input
                    id="title"
                    element="input"
                    type="text"
                    label="Title"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid title!"
                    onInput={inputHandler} />
                <Input
                    id="description"
                    type="textarea"
                    label="Description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please enter a valid description (at least 5 characters)."
                    onInput={inputHandler} />
                <ImageUpload
                    id="image"
                    onInput={inputHandler}
                    center
                />
                <Input
                    id="address"
                    element="input"
                    type="input"
                    label="Address"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid address!"
                    onInput={inputHandler} />
                <Button type="submit" disabled={!formState.isValid}>
                    ADD PLACE
                </Button>
            </form>
        </React.Fragment>)
}

export default AddPlace; 