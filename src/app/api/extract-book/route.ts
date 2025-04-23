import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
});

export async function POST(request: Request) {
  try {
    const { images } = await request.json();

    // First, get OCR text from all images
    const ocrResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images }),
    });

    if (!ocrResponse.ok) {
      const errorData = await ocrResponse.json();
      throw new Error(errorData.error || 'Failed to process images with OCR');
    }

    const { text } = await ocrResponse.json();
    console.log("OCR Extracted Text:", text);

    const prompt = `Below is the text extracted from book cover images using OCR. The first part is from the front cover, and the second part (if available) is from the back cover. Please analyze it and extract the following information in a structured format:

Extracted Text:
${text}

Please filter the following information from abve text:
1. Book Title (from front cover, look for the most prominent text)
2. Class (from front cover, look for class numbers or grades)
3. Book Description (from back cover if available, or front cover if not)
4. Edition (from back cover if available, look for words like "Edition", "Version", or numbers)
5. Publication (from back cover if available, look for publisher name and year)
6. MRP/Price (from back cover if available, look for currency symbols and numbers)

Please provide the information in the following format:
Title: [book title]
Class: [class]
Description: [book description]
Edition: [edition]
Publication: [publication]
MRP: [price]

If any information is not available or unclear, please indicate with "Not available".
If you find multiple possible values for any field, please provide the most likely one.
Focus on accuracy and only include information that is clearly present in the text.`;

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-zero:free",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Lower temperature for more consistent results
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    console.log("DeepSeek Response:", response);

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to extract book information' 
    }, { status: 500 });
  }
} 