// index.js
// This is the main entry point of our application
//type declaration
// required dependencies are initialized
const helmet = require('helmet');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();
//local module imports
const db = require('./db');
const models = require('./models');
//import schema as a module
const typeDefs = require('./schema');
//import resolver code
const resolvers = require('./resolvers');
//import jswonwebtoken module
const jwt = require('jsonwebtoken');
//import CORS middleware
const cors = require('cors');
//import module to prevent overnested queries
const depthLimit = require('graphql-depth-limit');
//import module to protect against overly complex queries
const { createComplexityLimitRule } = require('graphql-validation-complexity');

//get the user info from a jWT
const getUser = token => {
    if (token) {
        try {
            //return the user information from the token
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            //if there's a problem with token, throw an error
            throw new Error('Session invalid');
        }
    }
};

// run the server on a port specified in .env file or port 4000
const port = process.env.PORT || 4000;
//store the DB_HOST as a variable
const DB_HOST = process.env.DB_HOST;
//defining an array of notes
/*let notes = [
    { id: '1', content: 'This is a note', author: 'Saron Seyoum' },
    { id: '2', content: 'This is also a note', author: 'Tawanda Munongo'},
    { id: '3', content: 'This is not a note', author: 'Xeno'}
];*/

const app = express();
//add middleware for helmet (security) at the top of the stack
app.use(helmet());
//add middle ware for cross-origin resource sharing
app.use(cors());

//connect the DB
db.connect(DB_HOST);

//Apollo Server setup
const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    context: ({ req }) => {
        //get the suer token from the headers
        const token = req.headers.authorization;
        //try to retrieve a user with the token
        const user = getUser(token);
        //for now, let's log the user to the console:
        console.log(user);
        //add the db models to the context
        return { models, user };
    }
});

//Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: '/api'});

app.listen({ port }, () =>
    console.log(
        `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
    )
);
