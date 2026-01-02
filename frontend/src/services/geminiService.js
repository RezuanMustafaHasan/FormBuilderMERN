import axios from 'axios';

const API_URL = 'http://localhost:5001/api/ai';

export const geminiService = {
  async suggestFormDetails(topic) {
    try {
      const response = await axios.post(`${API_URL}/suggest-details`, { topic });
      return response.data;
    } catch (error) {
      console.error("AI Error:", error);
      return { title: topic, description: "Automated description generation failed." };
    }
  },

  async suggestQuestions(title, description) {
    try {
      const response = await axios.post(`${API_URL}/suggest-questions`, { title, description });
      return response.data;
    } catch (error) {
      console.error("AI Error:", error);
      return [];
    }
  }
};

