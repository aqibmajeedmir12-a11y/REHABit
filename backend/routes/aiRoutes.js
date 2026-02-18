const express = require("express");
const router = express.Router();
require("dotenv").config();



/* ═════════ OLLAMA CALL FUNCTION ═════════ */

async function callOllama(prompt){

  const response = await fetch(
    "http://localhost:11434/api/generate",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:"llama3",
        prompt:prompt,
        stream:false
      })
    }
  );

  const data = await response.json();

  return data.response || "AI not responding.";
}



/* ═════════ DAILY INSIGHTS ═════════ */

router.post("/insights", async (req,res)=>{

  try{

    const habits = req.body.habits || [];

    const text = habits.map(h=>
      `${h.name} - streak ${h.streak} - done ${h.done}`
    ).join("\n");


    const prompt = `
Analyze this habit data:

${text}

Give productivity insights and improvements.
`;

    const reply = await callOllama(prompt);

    res.json({ reply });

  }catch(err){
    res.json({ reply:"AI error." });
  }

});



/* ═════════ DAILY MOTIVATION ═════════ */

router.post("/motivation", async (req,res)=>{

  try{

    const habits = req.body.habits || [];

    const text = habits.map(h=>
      `${h.name} (${h.done?"Done":"Pending"})`
    ).join(", ");


    const prompt = `
Give a short motivational quote
based on these tasks:

${text}
`;

    const line = await callOllama(prompt);

    res.json({ line });

  }catch(err){
    res.json({ line:"Stay consistent — success follows discipline." });
  }

});



/* ═════════ AI CHATBOT ═════════ */

router.post("/chat", async (req,res)=>{

  try{

    const message = req.body.message || "Hello";

    const prompt = `
You are HabitAI — a friendly habit coach.

User says:
${message}

Reply shortly with motivation or guidance.
`;

    const reply = await callOllama(prompt);

    res.json({ reply });

  }catch(err){
    res.json({ reply:"AI chatbot error." });
  }

});

router.post("/predict", async (req,res)=>{

  const habits = req.body.habits;

  const text = habits.map(h=>
    `${h.name} streak ${h.streak}`
  ).join(", ");

  const prompt = `
Predict which habit streak may break soon:

${text}
`;

  const reply = await callOllama(prompt);

  res.json({ reply });

});

router.post("/planner", async (req,res)=>{

  const goal = req.body.goal;

  const prompt = `
Create 5 daily habits to achieve:

${goal}
`;

  const reply = await callOllama(prompt);

  res.json({ reply });

});



module.exports = router;
