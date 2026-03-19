const key = "AIzaSyBtuwvuh6_qZs7VBMQfG544p2_vsSlGyDc";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Say hello!" }] }]
  })
}).then(res => res.json())
  .then(data => console.log("gemini-2.5-flash:", JSON.stringify(data)))
  .catch(console.error);

const url2 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`;
fetch(url2, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Say hello!" }] }]
  })
}).then(res => res.json())
  .then(data => console.log("gemini-flash-latest:", JSON.stringify(data)))
  .catch(console.error);
