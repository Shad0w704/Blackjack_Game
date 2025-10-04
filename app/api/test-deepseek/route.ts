import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'DEEPSEEK_API_KEY not found in environment variables',
        envKeys: Object.keys(process.env).filter(key => key.includes('DEEPSEEK') || key.includes('API'))
      }, { status: 500 });
    }

    // Simple test without calling DeepSeek API
    return NextResponse.json({ 
      success: true, 
      message: 'API route is working!',
      apiKeyExists: true,
      apiKeyLength: apiKey.length,
      route: '/api/test-deepseek'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Also support POST for testing
export async function POST() {
  return NextResponse.json({ 
    message: 'POST method works too!',
    timestamp: new Date().toISOString()
  });
}