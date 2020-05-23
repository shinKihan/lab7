const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const morgan = require( 'morgan' );
const uuid = require('uuid');
const validateToken = require('./middleware/validateToken');
const { check, validationResult } = require('express-validator');

const app = express();
const jsonParser = bodyParser.json();

app.use(morgan('dev'));
app.use(validateToken)

let listOfPosts = [
    {
        id : uuid.v4(),
        title : "Example post 1",
        description: "Example description 1",
        url: "https://www.google.com",
        rating: 3
    },
    {
        id : uuid.v4(),
        title : "Example post 2",
        description: "Example description 2",
        url: "https://www.google.com",
        rating: 3
    },
    {
        id : uuid.v4(),
        title : "Example post 3",
        description: "Example description 3",
        url: "https://www.google.com",
        rating: 3
    },
];

app.get( '/bookmarks', ( req, res ) => {
    return res.status( 200 ).json( listOfPosts );
});

app.post( '/bookmarks', jsonParser, [
    check('title').isString().not().isEmpty(),
    check('description').isString().not().isEmpty(),
    check('url').isString().not().isEmpty(),
    check('rating').isNumeric().not().isEmpty(),
], ( req, res ) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(406).json({ errors: errors.array({ onlyFirstError: true }) })
    }

    let newPost = {
        id : uuid.v4(),
        title : req.body.title,
        description: req.body.description,
        url: req.body.url,
        rating: req.body.rating
    }

    listOfPosts.push(newPost)

    return res.status( 201 ).json(newPost);
});

const findPostById = (id) => {
    for (let i = 0; i<listOfPosts.length; i++) {
        if (listOfPosts[i].id == id) {
            return i;
        }
    }
    return -1;
}

app.patch( '/bookmark/:id', jsonParser, [
    check('id').isString().not().isEmpty(),
],( req, res ) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(406).json({ errors: errors.array({ onlyFirstError: true }) })
    }

    if (req.params.id != req.body.id) {
        res.statusMessage = `The id in the body doesn't match the one on the params`;
        return res.status(409).end();
    }

    let postIndex = findPostById(req.params.id);
    if (postIndex != -1) {
        let updatedPost = listOfPosts[postIndex];
        for (key in req.body.object) {
            updatedPost[key] = req.body.object[key];
        }
        listOfPosts[postIndex] = updatedPost;
        return res.status(202).json(updatedPost);
    } else {
        res.statusMessage = `Wasn't able to find a post with the id ${req.params.id}`;
        return res.status(404).end();
    }
});

app.delete( '/bookmark/:id', ( req, res ) => {
    let postIndex = findPostById(req.params.id);
    if (postIndex != -1) {
        listOfPosts.splice(postIndex, 1);
        return res.status(200).end();
    } else {
        res.statusMessage = `Wasn't able to find a post with the id ${req.params.id}`;
        return res.status(404).end();
    }
});

app.get( '/bookmark', ( req, res ) => {
    console.log(req.query);
    var title = req.query.title;
    console.log(title)
    if (title) {
        var foundPosts = listOfPosts.filter(post => post.title == title);
        
        if (foundPosts.length > 0) {
            return res.status(200).json(foundPosts);
        } else {
            res.statusMessage = `The title ${title} wasn't found on any of our titles.`;
            return res.status(404).end();
        }
        
    } else {
        res.statusMessage = 'A title is required in this endpoint.';
        return res.status(406).end();
    }
});

app.listen( 8080, () => {
    console.log( "This server is running on port 8080" );
});
