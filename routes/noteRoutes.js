const express = require('express');
const router = express.Router();
const Note = require('../models/Note'); // Import your Note model


// Create a new note
router.post('/notes', async (req, res) => {
    console.log(req.body); // Log the request body to check if title and content are received

    const {  title, content } = req.body;

    try {
        const newNote = new Note({
            
            title,
            content
        });
        console.log(newNote); // Log the new note object before saving

        await newNote.save();
        console.log('Note saved successfully:', newNote); // Log a success message after saving

        res.status(201).json(newNote); // Send a JSON response with the new note
    } catch (err) {
        console.error(err); // Log any errors that occur during the process

        res.status(500).send('Server Error'); // Send a 500 error response if there's an error
    }
});

router.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find(); // Fetch all notes from the database
        res.json(notes); // Send the notes as a JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
// Retrieve notes for a user
router.get('/notes/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const notes = await Note.find({ userId });
        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update a note
router.put('/notes/:noteId', async (req, res) => {
    const { noteId } = req.params;
    console.log(noteId,'noteidput')
    const { title, content } = req.body;

    try {
        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            { title, content, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).send('Note not found');
        }

        res.json(updatedNote);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Delete a note
router.delete('/notes/:noteId', async (req, res) => {
    const { noteId } = req.params;

    try {
        await Note.findByIdAndDelete(noteId);
        res.send('Note deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
