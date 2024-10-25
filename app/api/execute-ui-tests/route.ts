import { NextResponse } from 'next/server';
import mockData from './mock-data.json';

export async function POST(request: Request) {
  // Log the request data
  const requestData = await request.json();
  console.log('Received request data:', JSON.stringify(requestData, null, 2));

  // For now, we'll just return the mock data
  return NextResponse.json(mockData);
}

