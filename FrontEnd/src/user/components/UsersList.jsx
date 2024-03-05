import React from "react";
import UserItem from "./UserItem";
import "./UsersList.css";

const UsersList = (props) => {
    const usersList = props.items;
    if (usersList.length === 0) return (<div className="center">
        <h2>No users found!</h2>
    </div>)
    else return (
        <div>
            <ul className="users-list">
                {usersList.map(user => {
                    console.log("places: " + user.places);
                    return <UserItem key={user.id} id={user.id} image={user.image} name={user.name} placeCount={user.places.length} />
                })}
            </ul>
        </div>
    )
};

export default UsersList;