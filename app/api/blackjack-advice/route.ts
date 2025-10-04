// // app/api/blackjack-advice/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// export async function GET() {
//   return NextResponse.json({ 
//     message: 'Blackjack Advice API is running!',
//     usage: 'Send a POST request with playerHand, dealerUpcard, and playerValue'
//   });
// }

// export async function POST(request: NextRequest) {
//   try {
//     console.log('🎲 Blackjack Advice API called');
    
//     const body = await request.json();
//     const { playerHand, dealerUpcard, playerValue } = body;

//     console.log('📦 Request received:', { playerHand, dealerUpcard, playerValue });

//     const prompt = `You are a professional blackjack advisor. Analyze this hand and provide advice.

// Player's hand: ${playerHand.map((card: any) => `${card.value} of ${card.suit}`).join(', ')}
// Player's total: ${playerValue}
// Dealer's upcard: ${dealerUpcard.value} of ${dealerUpcard.suit}

// Based on basic blackjack strategy, should the player HIT or STAND? 
// Provide your answer in EXACTLY this format:
// ACTION: [HIT or STAND]
// REASON: [Brief explanation in 10 words or less]

// Example:
// ACTION: STAND
// REASON: Dealer shows 6, likely to bust

// Be concise and strategic.`;

//     const apiKey = process.env.DEEPSEEK_API_KEY;
    
//     if (!apiKey) {
//       console.error('❌ DEEPSEEK_API_KEY not found');
//       return NextResponse.json({ 
//         error: 'API key not configured',
//         action: 'STAND',
//         reason: 'API not configured'
//       }, { status: 500 });
//     }

//     console.log('🔑 API Key found, calling DeepSeek...');

//     // Test if API key is valid by making a simple call
//     const deepSeekResponse = await fetch('https://api.deepseek.com/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`
//       },
//       body: JSON.stringify({
//         model: 'deepseek-chat',
//         messages: [{ 
//           role: 'user', 
//           content: 'Say "Hello" in a creative way' 
//         }],
//         max_tokens: 20,
//         temperature: 0.3,
//         stream: false
//       })
//     });

//     console.log('📡 DeepSeek Test Response Status:', deepSeekResponse.status);

//     if (!deepSeekResponse.ok) {
//       const errorText = await deepSeekResponse.text();
//       console.error('❌ DeepSeek API Test Failed:', {
//         status: deepSeekResponse.status,
//         statusText: deepSeekResponse.statusText,
//         error: errorText
//       });
      
//       // Return a fallback response so the game still works
//       return NextResponse.json({ 
//         action: 'STAND', 
//         reason: 'AI service unavailable',
//         error: `DeepSeek API error: ${deepSeekResponse.status}`
//       });
//     }

//     console.log('✅ DeepSeek API test successful, making real request...');

//     // Now make the actual blackjack request
//     const response = await fetch('https://api.deepseek.com/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`
//       },
//       body: JSON.stringify({
//         model: 'deepseek-chat',
//         messages: [{ role: 'user', content: prompt }],
//         max_tokens: 100,
//         temperature: 0.3,
//         stream: false
//       })
//     });

//     console.log('📡 DeepSeek Blackjack Response Status:', response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ DeepSeek Blackjack API Error:', {
//         status: response.status,
//         error: errorText
//       });
      
//       // Return fallback advice based on basic blackjack strategy
//       const fallbackAdvice = getFallbackAdvice(playerValue, dealerUpcard.value);
//       return NextResponse.json(fallbackAdvice);
//     }

//     const data = await response.json();
//     console.log('✅ DeepSeek API Response received');

//     if (!data.choices || !data.choices[0] || !data.choices[0].message) {
//       console.error('❌ Invalid DeepSeek response structure');
//       const fallbackAdvice = getFallbackAdvice(playerValue, dealerUpcard.value);
//       return NextResponse.json(fallbackAdvice);
//     }

//     const text = data.choices[0].message.content;
//     console.log('📝 Raw AI Response:', text);

//     // Parse the response
//     const actionMatch = text.match(/ACTION:\s*(HIT|STAND)/i);
//     const reasonMatch = text.match(/REASON:\s*(.+)/i);

//     const action = actionMatch ? actionMatch[1].toUpperCase() : 'STAND';
//     const reason = reasonMatch ? reasonMatch[1].trim() : 'Follow basic strategy';

//     console.log('🎯 Final Advice:', { action, reason });

//     return NextResponse.json({ 
//       action, 
//       reason,
//       success: true
//     });

//   } catch (error: any) {
//     console.error('💥 Error in blackjack-advice API:', error);
    
//     // Return fallback advice even on errors
//     const fallbackAdvice = getFallbackAdvice(17, '6'); // Default fallback
//     return NextResponse.json(fallbackAdvice);
//   }
// }

// // Fallback basic blackjack strategy
// function getFallbackAdvice(playerValue: number, dealerCardValue: string): { action: string; reason: string } {
//   // Basic strategy: stand on 17+, hit on 16 or less
//   if (playerValue >= 17) {
//     return { 
//       action: 'STAND', 
//       reason: 'Basic strategy: Stand on 17 or higher'
//     };
//   } else {
//     return { 
//       action: 'HIT', 
//       reason: 'Basic strategy: Hit on 16 or less'
//     };
//   }
// }


// app/api/blackjack-advice/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Blackjack Advice API is running!',
    usage: 'Send a POST request with playerHand, dealerUpcard, and playerValue'
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎲 Blackjack Advice API called');
    
    const body = await request.json();
    const { playerHand, dealerUpcard, playerValue } = body;

    console.log('📦 Request received:', { 
      playerHand, 
      dealerUpcard, 
      playerValue 
    });

    // Try DeepSeek API first
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.log('🔑 No API key, using fallback strategy');
      const fallbackAdvice = getSmartFallbackAdvice(playerHand, dealerUpcard, playerValue);
      return NextResponse.json(fallbackAdvice);
    }

    console.log('🔑 API Key found, calling DeepSeek...');

    const prompt = `You are a professional blackjack advisor. Analyze this hand and provide advice.

Player's hand: ${playerHand.map((card: any) => `${card.value} of ${card.suit}`).join(', ')}
Player's total: ${playerValue}
Dealer's upcard: ${dealerUpcard.value} of ${dealerUpcard.suit}

Based on basic blackjack strategy, should the player HIT or STAND? 
Provide your answer in EXACTLY this format:
ACTION: [HIT or STAND]
REASON: [Brief explanation in 10 words or less]

Example:
ACTION: STAND
REASON: Dealer shows 6, likely to bust

Be concise and strategic.`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.3,
        stream: false
      })
    });

    console.log('📡 DeepSeek Response Status:', response.status);

    if (response.status === 402) {
      console.log('💳 DeepSeek API: Payment required, using smart fallback');
      const fallbackAdvice = getSmartFallbackAdvice(playerHand, dealerUpcard, playerValue);
      return NextResponse.json(fallbackAdvice);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API Error:', response.status, errorText);
      const fallbackAdvice = getSmartFallbackAdvice(playerHand, dealerUpcard, playerValue);
      return NextResponse.json(fallbackAdvice);
    }

    const data = await response.json();
    console.log('✅ DeepSeek API Response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid DeepSeek response structure');
      const fallbackAdvice = getSmartFallbackAdvice(playerHand, dealerUpcard, playerValue);
      return NextResponse.json(fallbackAdvice);
    }

    const text = data.choices[0].message.content;
    console.log('📝 Raw AI Response:', text);

    // Parse the response
    const actionMatch = text.match(/ACTION:\s*(HIT|STAND)/i);
    const reasonMatch = text.match(/REASON:\s*(.+)/i);

    const action = actionMatch ? actionMatch[1].toUpperCase() : 'STAND';
    const reason = reasonMatch ? reasonMatch[1].trim() : 'Follow basic strategy';

    console.log('🎯 Final Advice:', { action, reason });

    return NextResponse.json({ 
      action, 
      reason,
      source: 'ai'
    });

  } catch (error: any) {
    console.error('💥 Error in blackjack-advice API:', error);
    const fallbackAdvice = getSmartFallbackAdvice(
      [{ suit: 'Hearts', value: '10' }, { suit: 'Spades', value: '7' }],
      { suit: 'Diamonds', value: '6' },
      17
    );
    return NextResponse.json(fallbackAdvice);
  }
}

// Smart fallback based on actual blackjack basic strategy
function getSmartFallbackAdvice(playerHand: any[], dealerUpcard: any, playerValue: number): { 
  action: string; 
  reason: string;
  source: string;
} {
  const dealerValue = cardToValue(dealerUpcard.value);
  
  console.log('🤖 Using smart fallback strategy:', {
    playerValue,
    dealerCard: dealerUpcard.value,
    dealerValue,
    playerHand: playerHand.map(card => card.value)
  });

  // Check for soft hands (ace counted as 11)
  const hasAce = playerHand.some(card => card.value === 'A');
  const isSoftHand = hasAce && playerValue <= 21 && playerValue !== calculateHandValueHard(playerHand);

  if (isSoftHand) {
    return handleSoftHand(playerValue, dealerValue, playerHand);
  }

  // Handle pairs
  if (playerHand.length === 2 && playerHand[0].value === playerHand[1].value) {
    return handlePairs(playerHand[0].value, dealerValue);
  }

  // Hard hand strategy (no ace, or ace counted as 1)
  return handleHardHand(playerValue, dealerValue);
}

function handleSoftHand(playerValue: number, dealerValue: number, playerHand: any[]): { 
  action: string; 
  reason: string;
  source: string;
} {
  // Soft hand strategy (Ace counted as 11)
  if (playerValue >= 19) {
    return { action: 'STAND', reason: 'Soft 19+ always stand', source: 'strategy' };
  }
  if (playerValue === 18) {
    if (dealerValue >= 9) {
      return { action: 'HIT', reason: 'Soft 18 vs 9-A hit', source: 'strategy' };
    }
    return { action: 'STAND', reason: 'Soft 18 vs 2-8 stand', source: 'strategy' };
  }
  // Always hit soft 17 or less
  return { action: 'HIT', reason: 'Soft 17 or less always hit', source: 'strategy' };
}

function handlePairs(pairValue: string, dealerValue: number): { 
  action: string; 
  reason: string;
  source: string;
} {
  const pairNum = cardToValue(pairValue);
  
  // Always split Aces and 8s
  if (pairValue === 'A' || pairValue === '8') {
    return { action: 'SPLIT', reason: `Always split ${pairValue}s`, source: 'strategy' };
  }
  // Never split 5s or 10s
  if (pairValue === '5' || pairValue === '10' || pairValue === 'J' || pairValue === 'Q' || pairValue === 'K') {
    return { action: 'HIT', reason: `Treat ${pairValue}s as hard hand`, source: 'strategy' };
  }
  // Split 2s, 3s, 7s vs 2-7
  if ((pairValue === '2' || pairValue === '3' || pairValue === '7') && dealerValue <= 7) {
    return { action: 'SPLIT', reason: `Split ${pairValue}s vs dealer 2-7`, source: 'strategy' };
  }
  // Split 6s vs 2-6
  if (pairValue === '6' && dealerValue <= 6) {
    return { action: 'SPLIT', reason: `Split 6s vs dealer 2-6`, source: 'strategy' };
  }
  // Split 9s vs 2-9 except 7
  if (pairValue === '9' && dealerValue <= 9 && dealerValue !== 7) {
    return { action: 'SPLIT', reason: `Split 9s vs dealer 2-6,8,9`, source: 'strategy' };
  }
  
  return { action: 'HIT', reason: `Default for ${pairValue}s`, source: 'strategy' };
}

function handleHardHand(playerValue: number, dealerValue: number): { 
  action: string; 
  reason: string;
  source: string;
} {
  // Basic strategy for hard hands
  if (playerValue >= 17) {
    return { action: 'STAND', reason: '17+ always stand', source: 'strategy' };
  }
  if (playerValue >= 13) {
    if (dealerValue <= 6) {
      return { action: 'STAND', reason: '13-16 vs 2-6 stand', source: 'strategy' };
    }
    return { action: 'HIT', reason: '13-16 vs 7-A hit', source: 'strategy' };
  }
  if (playerValue === 12) {
    if (dealerValue >= 4 && dealerValue <= 6) {
      return { action: 'STAND', reason: '12 vs 4-6 stand', source: 'strategy' };
    }
    return { action: 'HIT', reason: '12 vs 2-3,7-A hit', source: 'strategy' };
  }
  // Always hit 11 or less
  return { action: 'HIT', reason: '11 or less always hit', source: 'strategy' };
}

// Helper functions
function cardToValue(card: string): number {
  if (card === 'A') return 11;
  if (card === 'K' || card === 'Q' || card === 'J') return 10;
  return parseInt(card);
}

function calculateHandValueHard(hand: any[]): number {
  return hand.reduce((total, card) => {
    if (card.value === 'A') return total + 1;
    if (card.value === 'K' || card.value === 'Q' || card.value === 'J') return total + 10;
    return total + parseInt(card.value);
  }, 0);
}