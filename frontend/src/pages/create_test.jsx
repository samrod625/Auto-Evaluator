import React, { useState } from "react";

const CreateTest = ({ onCreate }) => {
  const [formData, setFormData] = useState({
    title: "",
    question: "",
    opt1: "",
    opt2: "",
    opt3: "",
    opt4: "",
    answer: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, question, opt1, opt2, opt3, opt4, answer } = formData;
    const newTest = {
      title,
      question,
      options: [opt1, opt2, opt3, opt4],
      answer,
    };
    onCreate(newTest);
    setFormData({
      title: "",
      question: "",
      opt1: "",
      opt2: "",
      opt3: "",
      opt4: "",
      answer: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input name="title" value={formData.title} onChange={handleChange} placeholder="Test Title" className="border p-2 w-full" required />
      <input name="question" value={formData.question} onChange={handleChange} placeholder="Question" className="border p-2 w-full" required />
      <input name="opt1" value={formData.opt1} onChange={handleChange} placeholder="Option 1" className="border p-2 w-full" required />
      <input name="opt2" value={formData.opt2} onChange={handleChange} placeholder="Option 2" className="border p-2 w-full" required />
      <input name="opt3" value={formData.opt3} onChange={handleChange} placeholder="Option 3" className="border p-2 w-full" required />
      <input name="opt4" value={formData.opt4} onChange={handleChange} placeholder="Option 4" className="border p-2 w-full" required />
      <input name="answer" value={formData.answer} onChange={handleChange} placeholder="Correct Answer" className="border p-2 w-full" required />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create Test</button>
    </form>
  );
};

export default CreateTest;
