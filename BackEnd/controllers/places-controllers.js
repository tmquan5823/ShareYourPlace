const fs = require("fs");

const HttpError = require('../models/http-error');
const getCoordinatesForAddress = require("../util/position");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../models/user");
const Place = require("../models/place");
const { log } = require("console");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid; // { pid: 'p1' }
    console.log("get place: " + placeId);

    let place;
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        return next(new HttpError("Could not find place!", 500));
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided id.', 404);
        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    console.log("User:" + userId);

    let userPlaces;
    try {
        userPlaces = await User.findById(userId).populate("places");
    } catch (err) {
        console.log(err);
        return next(new HttpError("Could not find place!111", 500));
    }

    if (!userPlaces) {
        const error = new HttpError('Could not find a place for the provided userId.', 404);
        return next(error);
    }
    console.log(userPlaces.places);
    res.json({ places: userPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordinatesForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id.', 404);
        return next(error);
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        // sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        // await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        throw new HttpError("Invalid input value, please check your data!", 422);
    }

    const { title, description } = req.body;
    const pid = req.params.pid;

    let place;
    try {
        place = await Place.findById(pid);
    } catch (err) {
        return next(new HttpError("Could not update this place! PlaceID is undifined!", 500));
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Could not update this place! Save to DB failed!", 500));
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
    const placeID = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeID).populate("creator");
    } catch (err) {
        console.log(err);
        return next(new HttpError("Could not delete this place! PlaceID is undifined!", 500));
    }

    if (!place) {
        return next(new HttpError("Could not delete this place!", 500));
    }

    const imagePath = place.image;

    try {
        await place.deleteOne();
        place.creator.places.pull(place);
        await place.creator.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Could not delete this place! Cann't remove this place!", 500));
    }

    fs.unlink(imagePath, err => {
        console.log(err);
    })

    res.status(200).json({ message: "Deleted!" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
