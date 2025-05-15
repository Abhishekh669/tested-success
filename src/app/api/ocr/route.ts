import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://localhost:3000", // Replace with your domain
    "X-Title": "Book Information Extractor" // Replace with your app name
  }
});

export async function POST(request: Request) {
  try {
    const { images, imageCount } = await request.json();
    
    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Process the first image only for now
    const imageData = images[0];

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-zero:free",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this book cover image carefully and extract the following information with high accuracy:

1. Book Title: Extract the main title exactly as shown on the cover
2. Description: Look for any subtitle, tagline, or brief description on the cover
3. Edition: Find any edition information (e.g., '2nd Edition', 'International Edition')
4. MRP/Price: Look for any price information, including currency symbol

Important:
- If any information is not visible or unclear, respond with "Not visible" for that field
- Ensure exact text matching from the cover
- Do not make assumptions or add information not present on the cover

Format the response strictly as:
Title: [exact title from cover]
Description: [exact description/subtitle from cover]
Edition: [exact edition info from cover]
MRP: [exact price from cover]`
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    const extractedText = completion.choices[0].message.content;
    return NextResponse.json({ data: extractedText });
  } catch (error) {
    console.error('Text Extraction Error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
} 
