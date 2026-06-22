import fetch from 'node-fetch';

async function testDonna() {
  const payload = {
    messages: [
      { role: "user", content: "César: Haz un post para LinkedIn o dame ideas de qué puedo hacer en función de los riesgos reales que puede tener la inteligencia artificial como mitos en una sociedad tan poco tecnológica como Ecuador." }
    ],
    provider: "gemini" 
  };

  console.log("Enviando petición a Donna (localhost:3000)...");
  
  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log("\n==================================");
    console.log("🤖 RESPUESTA RAZONADOR (LOG LOCALHOST) Y DONNA RAW:");
    console.log("==================================\n");
    console.log(text);
    console.log("\n==================================");
    
  } catch(e) {
    console.error("Error conectando con Donna:", e);
  }
}

testDonna().catch(console.error);
