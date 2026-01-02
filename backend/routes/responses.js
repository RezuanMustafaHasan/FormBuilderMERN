const express = require('express');
const router = express.Router();
const Response = require('../models/Response');

// Get responses for a form
router.get('/:formId', async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId }).sort({ submittedAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit response
router.post('/', async (req, res) => {
  try {
    const { formId, respondentUserId, answers } = req.body;
    
    // Convert simplified answers to schema format if needed, 
    // but assuming frontend sends correct structure: { questionId, value }
    
    const newResponse = new Response({
      formId,
      respondentUserId,
      answers
    });
    
    await newResponse.save();
    res.status(201).json(newResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
