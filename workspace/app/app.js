require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Initialize all API Tempo routes
const usersRoute = require("../../components/users");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use(express.static("public"));

app.use("/api/users", usersRoute);

module.exports = app;
