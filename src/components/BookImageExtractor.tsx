'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
interface BookData {
  title: string;
  class: string;
  description: string;
  edition: string;
  mrp: string;
  publication: string;
}

export default function BookImageExtractor() {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [ocrText, setOcrText] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'front') {
        setFrontImage(file);
      } else {
        setBackImage(file);
      }
    }
  };

  const extractBookInfo = async () => {
    if (!frontImage) {
      setError('Please upload front image of the book');
      return;
    }

    setLoading(true);
    setError(null);
    setBookData(null);
    setOcrText('');

    try {
      // Convert images to base64
      const frontBase64 = await convertToBase64(frontImage);
      const backBase64 = backImage ? await convertToBase64(backImage) : null;

      // Prepare images array
      const images = [frontBase64];
      if (backBase64) {
        images.push(backBase64);
      }

      // First, get OCR text
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });

      if (!ocrResponse.ok) {
        throw new Error('Failed to process images with OCR');
      }

      const { text } = await ocrResponse.json();
      setOcrText(text);

      // Then, get filtered book information
      const bookResponse = await fetch('/api/extract-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });

      if (!bookResponse.ok) {
        throw new Error('Failed to extract book information');
      }

      const { data } = await bookResponse.json();
      
      // Parse the response into structured data
      const parsedData = parseBookData(data);
      setBookData(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const parseBookData = (text: string): BookData => {
    // Remove any boxed formatting and clean the text
    const cleanedText = text.replace(/\\boxed{/g, '').replace(/}/g, '');
    
    const lines = cleanedText.split('\n');
    const data: BookData = {
      title: 'Not available',
      class: 'Not available',
      description: 'Not available',
      edition: 'Not available',
      mrp: 'Not available',
      publication: 'Not available'
    };

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('title:')) {
        data.title = line.split('Title:')[1].trim();
      } else if (lowerLine.includes('class:')) {
        data.class = line.split('Class:')[1].trim();
      } else if (lowerLine.includes('description:')) {
        data.description = line.split('Description:')[1].trim();
      } else if (lowerLine.includes('edition:')) {
        data.edition = line.split('Edition:')[1].trim();
      } else if (lowerLine.includes('mrp:')) {
        data.mrp = line.split('MRP:')[1].trim();
      } else if (lowerLine.includes('publication:')) {
        data.publication = line.split('Publication:')[1].trim();
      }
    });

    return data;
  };

  const renderBookInfo = (label: string, value: string) => {
    if (value === 'Not available') {
      return null;
    }
    return (
      <div>
        <Label>{label}</Label>
        <div className="font-medium">{value}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="front-image">Front Cover Image</Label>
          <Input
            id="front-image"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'front')}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="back-image">Back Cover Image (Optional)</Label>
          <Input
            id="back-image"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'back')}
            disabled={loading}
          />
        </div>
      </div>

      <Button onClick={extractBookInfo} disabled={loading || !frontImage}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Extract Book Information'
        )}
      </Button>

      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}

      {ocrText && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Text</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{ocrText}</pre>
          </CardContent>
        </Card>
      )}

      {bookData && (
        <Card>
          <CardHeader>
            <CardTitle>Book Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderBookInfo('Title', bookData.title)}
              {renderBookInfo('Class', bookData.class)}
              {renderBookInfo('Edition', bookData.edition)}
              {renderBookInfo('MRP', bookData.mrp)}
              {renderBookInfo('Publication', bookData.publication)}
            </div>
            {bookData.description !== 'Not available' && (
              <div>
                <Label>Description</Label>
                <div className="font-medium mt-2">{bookData.description}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
