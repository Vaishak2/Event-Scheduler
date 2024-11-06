// Router File
const express = require('express');
const Event = require('../models/eventModel');
const router = express.Router();
// Router to render Index file
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({}); // Fetch all events from the database
    res.render('index', { events }); // Pass events to the index view
    console.log(events)
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).send({ error: 'Error fetching events' });
  }
});

// _____________________________________________________________________________________

// Handle POST request to create a new event
router.post('/events', async (req, res) => {
  console.log(req.body); // Debugging line
  const { name, startDateTime, frequency, customFrequencyLogic, exclusionDates } = req.body;

  try {
    const newEvent = new Event({
      name,
      startDateTime,
      frequency,
      customFrequencyLogic,
      exclusionDates,
    });
    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ error: 'Error creating event', details: error.message });
  }
});

// _____________________________________________________________________________________

// GET /api/events - Retrieve paginated events
router.get('/api/events', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const events = await Event.find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Calculate the next occurrence for each event
    events.forEach(event => {
      event.nextOccurrence = calculateNextOccurrence(event);
    });

    res.json({ page, events });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// _____________________________________________________________________________________

// POST /api/events - Create a new event
router.post('/api/events', async (req, res) => {
  try {
    const { name, startDateTime, frequency, customFrequency, exclusionDates } = req.body;

    if (!name || !startDateTime || !frequency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedExclusionDates = exclusionDates
      ? exclusionDates.split(',').map(date => new Date(date.trim()))
      : [];

    const newEvent = new Event({
      name,
      startDateTime: new Date(startDateTime),
      frequency,
      customFrequency,
      exclusionDates: parsedExclusionDates,
      nextOccurrence: calculateNextOccurrence({
        startDateTime: new Date(startDateTime),
        frequency,
        exclusionDates: parsedExclusionDates
      }),
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Error creating event' });
  }
});

module.exports = router;