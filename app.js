'use strict';
const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}`});
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require('./swagger.json');
const bodyParser = require('body-parser');
const Helper = require('./common/helper');
const logger = Helper.getLogger('app');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

const corsOptions = {
    origin: ["*"],
    credentials: true,
    methods: "POST, PUT, OPTIONS, DELETE, GET",
    allowedHeaders: "X-Requested-With, Content-Type, jwtAuthToken"
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

require('./startup/routes.v1')(app);
require('./startup/db')();
require('./startup/config')();

if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}


app.get('/', async (req, res)  => {
    res.status(200).json({
        message: `ID: ${process.env.PORT}`,
        success: true,
        status: 200
    })
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server listening to ${process.env.PORT}`)
    logger.info(`Server listening to ${process.env.PORT}`);
});

process.on('uncaughtException', ex => {
    logger.error('>> uncaughtException:', ex);
});


server.timeout = 240000;
module.exports = server;