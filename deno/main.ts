import { serveStatic } from "https://deno.land/x/hono@v3.7.5/adapter/deno/serve-static.ts";

import { Hono } from 'https://deno.land/x/hono@v4.2.4/mod.ts';

const app = new Hono();

app.use('/', serveStatic({ root: '/public' }));

app.post('/text-to-speech', async (c) => {
  const { text } = await c.req.json();
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  // Ensure the text is provided
  if (!text) {
    return c.json({ error: 'Text is required' }, 400);
  }

  // Fetch speech data from OpenAI Text-to-Speech API
  const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice: "alloy"
    })
  });

  if (!ttsResponse.ok) {
    const errorText = await ttsResponse.text();
    return c.json({ error: 'Error with Text-to-Speech API', details: errorText }, ttsResponse.status);
  }

  const mp3Data = await ttsResponse.arrayBuffer();

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
