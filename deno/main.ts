import { Hono } from 'https://deno.land/x/hono@v4.2.4/mod.ts';

const app = new Hono();



app.post('/text-to-speech', async (c) => {
  const { input } = await c.req.json();
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  // Ensure the text is provided
  if (!input) {
    return c.json({ error: 'input is required' }, 400);
  }

  // Fetch speech data from OpenAI Text-to-Speech API
  const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      input: {
        input: input
      },
      model: "tts-1",
      voice: "alloy",
      output_format: "mp3"
    })
  });

  if (!ttsResponse.ok) {
    const errorText = await ttsResponse.text();
    return c.json({ error: 'Error with Text-to-Speech API', details: errorText }, ttsResponse.status);
  }

  const mp3Data = await ttsResponse.body;

  // Set response headers to indicate the content type for streaming
  c.header('Content-Type', 'audio/mpeg');
  
  // Return the MP3 data as the response body
  return new Response(mp3Data, {
    headers: {
      'Content-Type': 'audio/mpeg',
    }
  });
});

Deno.serve(app.fetch);