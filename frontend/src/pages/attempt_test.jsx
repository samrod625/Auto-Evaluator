import React, { useState } from "react";

const AttemptTest = ({ tests }) => {
  const [studentAnswers, setStudentAnswers] = useState({});
  const [results, setResults] = useState({});

  const handleSubmit = (e, test) => {
    e.preventDefault();
    const selected = studentAnswers[test.title];
    const correct = test.answer;
    setResults({
      ...results,
      [test.title]: selected === correct ? "Correct! 🎉" : `Wrong 😢 Correct answer: ${correct}`,
    });
  };

  return (
    <div>
      {tests.length === 0 ? (
        <p>No tests available.</p>
      ) : (
        <ul className="space-y-4">
          {tests.map((test) => (
            <li key={test.title} className="border p-4 rounded">
              <h3 className="font-bold">{test.title}</h3>
              <p>{test.question}</p>
              <form onSubmit={(e) => handleSubmit(e, test)}>
                {test.options.map((opt) => (
                  <label key={opt} className="block">
                    <input
                      type="radio"
                      name={test.title}
                      value={opt}
                      onChange={(e) =>
                        setStudentAnswers({ ...studentAnswers, [test.title]: e.target.value })
                      }
                      required
                    />
                    {" "}{opt}
                  </label>
                ))}
                <button type="submit" className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">
                  Submit
                </button>
              </form>
              {results[test.title] && (
                <p className="mt-2 font-semibold">Result: {results[test.title]}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttemptTest;
