const express = require('express');
const crafts = require('./record');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Joi = require('joi');
const cors = require('cors'); 


const schema = Joi.object({
    image: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    supplies: Joi.array().items(Joi.string().required()).required()
});


const app = express();
app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/crafts')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: storage
})


// Serve static files from the "static" directory
app.use(express.static('static'));

// Define the route for the root URL of the website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Define the route for the /api/crafts URL
app.get('/api/crafts', (req, res) => {
    res.send(crafts);
});

// save the record
app.post('/api/crafts', upload.single('file'), (req, res) => {
    // file to static/crafts 
    const filePath = path.join('static/crafts', req.file.originalname);
    fs.rename(req.file.path, filePath, async function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('File upload failed');
            return;
        }

        req.body.supplies = JSON.parse(req.body.supplies);
        req.body.image = req.file.originalname;

        // Validate the data
        try {
            await schema.validateAsync(req.body);
        } catch (err) {
            console.error('Validation failed:', err.details);
            res.status(400).send('Invalid data');
            return;
        }


        // req.body contains the text fields
        crafts.push(req.body);
        res.send('Record and file added to the database');
    });
});


// update the record
app.put('/api/crafts/:id',upload.single('image'), (req, res) => {
    const id = req.params.id;

    if (id < 0 || id >= crafts.length) {
        res.status(404).send('Craft not found');
        return;
    }

    const supplies = JSON.parse(req.body.supplies);

    // Update the craft
    const updatedCraft = {
        ...req.body,
        image: req.file ? req.file.filename : crafts[id].image,
        supplies: supplies
    };
    crafts[id] = updatedCraft;
    res.send('Craft updated');
});

// delete the record
app.delete('/api/crafts/:id', (req, res) => {
    const id = req.params.id;
    if (id < 0 || id >= crafts.length) {
        res.status(404).send('Craft not found');
        return;
    }

    // Delete the craft
    crafts.splice(id, 1);
    res.send('Craft deleted');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});