const key = "AIzaSyBtuwvuh6_qZs7VBMQfG544p2_vsSlGyDc";
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log("AVAILABLE MODELS:");
      data.models.forEach(m => {
        if (m.name.includes('gemini')) {
          console.log(`- ${m.name}`);
        }
      });
    } else {
      console.log("ERROR or NO MODELS:", data);
    }
  })
  .catch(console.error);
