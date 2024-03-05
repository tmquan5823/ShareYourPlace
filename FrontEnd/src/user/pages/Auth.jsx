import React, { useState, useContext } from "react";

import Card from "../../Elements/components/UIElements/Card";
import Button from "../../Elements/components/FormElements/Button";
import Input from "../../Elements/components/FormElements/Input";
import ErrorModal from "../../Elements/components/UIElements/ErrorModal";
import LoadingSpinner from "../../Elements/components/UIElements/LoadingSpinner";
import ImageUpload from "../../Elements/components/FormElements/ImageUpload";

import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH, VALIDATOR_EMAIL } from "../../Elements/util/validators";
import { useForm } from "../../Elements/Hooks/form-hooks";
import { useHttpClient } from "../../Elements/Hooks/http-hook";
import { AuthContext } from "../../Elements/Context/auth-context";

import "./Auth.css";

const Auth = props => {
    const auth = useContext(AuthContext);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: "",
            isValid: false
        }, password: {
            value: "",
            isValid: false
        }
    }, false)

    async function onSubmitHandler(event) {
        event.preventDefault();

        console.log(formState.inputs);

        if (isLoginMode) {
            try {
                const responseData = await sendRequest('http://localhost:5000/api/users/login', 'POST',
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }),
                    {
                        'Content-Type': 'application/json'
                    });
                auth.login(responseData.userID, responseData.token);
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                var formData = new FormData();
                formData.append('email', formState.inputs.email.value);
                formData.append('name', formState.inputs.name.value);
                formData.append('password', formState.inputs.password.value);
                formData.append('image', formState.inputs.image.value);
                const responseData = await sendRequest('http://localhost:5000/api/users/signup', 'POST', formData);
                auth.login(responseData.userID, responseData.token);
            } catch (err) {
                console.log(err);
            }
        }
    }

    function switchModeHandler(event) {
        if (!isLoginMode) {
            setFormData({
                ...formState.inputs,
                name: undefined,
                image: undefined
            }, formState.inputs.email.isValid && formState.inputs.password.isValid)
        } else {
            setFormData({
                ...formState.inputs,
                name: {
                    value: "",
                    isValid: false
                },
                image: {
                    value: null,
                    isValid: false
                }
            }, false)
        }
        setIsLoginMode(preState => !preState)
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay />}
                <h2>LOGIN</h2>
                <hr />
                <form onSubmit={onSubmitHandler}>
                    {!isLoginMode && <Input
                        id="name"
                        type="text"
                        element="input"
                        label="Your show name"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter a valid name!"
                        onInput={inputHandler}
                    />}
                    {!isLoginMode && <ImageUpload
                        id="image"
                        center
                        onInput={inputHandler}
                    />}
                    <Input
                        id="email"
                        element="input"
                        type="email"
                        label="Email"
                        validators={[VALIDATOR_EMAIL()]}
                        errorText="Please enter a valid email!"
                        onInput={inputHandler}
                    />
                    <Input
                        id="password"
                        element="input"
                        type="password"
                        label="Password"
                        validators={[VALIDATOR_MINLENGTH(8)]}
                        errorText="Please enter a valid password (at least 8 characters)."
                        onInput={inputHandler}
                    />
                    <Button type="submit" disabled={!formState.isValid}>{isLoginMode ? "LOGIN" : "SIGNUP"}</Button>
                </form>
                <Button inverse onClick={switchModeHandler}>Switch to {isLoginMode ? "register" : "login"}</Button>
            </Card>
        </React.Fragment>
    )
};

export default Auth;