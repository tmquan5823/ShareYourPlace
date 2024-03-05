import React, { useState, useEffect } from 'react';
import UsersList from "../components/UsersList";
import ErrorModal from "../../Elements/components/UIElements/ErrorModal";
import LoadingSpinner from "../../Elements/components/UIElements/LoadingSpinner";
import { useHttpClient } from '../../Elements/Hooks/http-hook';

const Users = props => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [users, setUsers] = useState();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(
                    'http://localhost:5000/api/users'
                );
                setUsers(responseData.users);
            } catch (err) { }
        };
        fetchUsers();
    }, [sendRequest]);

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <div className='center'>
                <LoadingSpinner />
            </div>}
            {!isLoading && users && <UsersList items={users} />}
        </React.Fragment>
    );
}

export default Users;