const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, "-password")
    } catch (err) {
        console.log(err);
        return next(new HttpError("Fetching users failed!", 500))
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const login = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        throw new HttpError("Invalid input value, please check your data!", 422);
    }

    const { email, password } = req.body;

    let userAccount;
    try {
        userAccount = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError("Logging in failed!", 500));
    }

    if (!userAccount) {
        return next(new HttpError("Invalid email or password!", 401));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, userAccount.password);
    } catch (err) {
        console.log(err);
        const error = new HttpError("Could not login!", 500);
        return next(error);
    }
    if (!isValidPassword) {
        const error = new HttpError("Could not login, please check your password!", 401);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            { userID: userAccount.id, email: userAccount.email },
            "mySecretHihi",
            { expiresIn: '1h' }
        );
    } catch (err) {
        console.log(err);
        return next(new HttpError("Login failed!", 500));
    }

    res.status(201).json({ userID: userAccount.id, email: userAccount.email, token: token });
};

const signup = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return next(new HttpError("Invalid input value, please check your data!", 422));
    }

    const { name, email, password } = req.body;

    let existedUser;
    try {
        existedUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError("Signing up failed!", 500));
    }

    if (existedUser) {
        return next(new HttpError("User email already existed!", 422));
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);

    } catch (err) {
        console.log(err);
        const error = new HttpError("Could not create new user!", 500);
        return next(error);
    }

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        image: req.file.path,
        places: []
    });

    try {
        await newUser.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Signing up failed!", 500));
    }

    let token;
    try {
        token = jwt.sign(
            { userID: newUser.id, email: newUser.email },
            "mySecretHihi",
            { expiresIn: '1h' }
        );
    } catch (err) {
        console.log(err);
        return next(new HttpError("Signing up failed!", 500));
    }

    console.log(newUser.toObject({ getters: true }));
    res.status(201).json({ userID: newUser.id, email: newUser.email, token: token });
};

exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;