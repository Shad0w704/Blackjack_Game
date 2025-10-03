export type Card = {
  suit: 'Diamonds' | 'Spades' | 'Hearts' | 'Clubs';
  value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'] as const;
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateHandValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.value === 'A') {
      total += 11;
      aces++;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      total += 10;
    } else {
      total += Number(card.value);
    }
  }
  
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  return total;
}

export function initialDeal(deck: Card[]): {
  playerHand: Card[];
  dealerHand: Card[];
  remainingDeck: Card[];
} {
  return {
    playerHand: [deck[0], deck[2]],
    dealerHand: [deck[1], deck[3]],
    remainingDeck: deck.slice(4)
  };
}



// 'use client';

// import { motion } from 'framer-motion';
// import { useState, useEffect } from 'react';

// // Types
// type Card = {
//   suit: 'Diamonds' | 'Spades' | 'Hearts' | 'Clubs';
//   value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
// }

// // Game functions
// function createDeck(): Card[] {
//   const deck: Card[] = [];
//   const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'] as const;
//   const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

//   for (const suit of suits) {
//     for (const value of values) {
//       deck.push({ suit, value });
//     }
//   }
//   return deck;
// }

// function shuffleDeck(deck: Card[]): Card[] {
//   const shuffled = [...deck];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

// function calculateHandValue(hand: Card[]): number {
//   let total = 0;
//   let aces = 0;
  
//   for (const card of hand) {
//     if (card.value === 'A') {
//       total += 11;
//       aces++;
//     } else if (['J', 'Q', 'K'].includes(card.value)) {
//       total += 10;
//     } else {
//       total += Number(card.value);
//     }
//   }
  
//   while (total > 21 && aces > 0) {
//     total -= 10;
//     aces--;
//   }
  
//   return total;
// }

// function initialDeal(deck: Card[]): {
//   playerHand: Card[];
//   dealerHand: Card[];
//   remainingDeck: Card[];
// } {
//   return {
//     playerHand: [deck[0], deck[2]],
//     dealerHand: [deck[1], deck[3]],
//     remainingDeck: deck.slice(4)
//   };
// }

// export default function BlackjackGame() {
//   const [playerHand, setPlayerHand] = useState<Card[]>([]);
//   const [dealerHand, setDealerHand] = useState<Card[]>([]);
//   const [deck, setDeck] = useState<Card[]>([]);
//   const [gameState, setGameState] = useState<'waiting' | 'player-turn' | 'dealer-turn' | 'game-over'>('waiting');
//   const [gameResult, setGameResult] = useState<'win' | 'lose' | 'tie' | 'blackjack' | ''>('');
//   const [chips, setChips] = useState(1000);
//   const [currentBet, setCurrentBet] = useState(0);
//   const [betInput, setBetInput] = useState<string>('');

//   useEffect(() => {
//     if (gameState === 'waiting') {
//       setPlayerHand([]);
//       setDealerHand([]);
//       setDeck([]);
//       setGameResult('');
//     }
//   }, [gameState]);

//   // Check for blackjack on initial deal
//   useEffect(() => {
//     if (gameState === 'player-turn' && playerHand.length === 2) {
//       const playerValue = calculateHandValue(playerHand);
//       const dealerValue = calculateHandValue(dealerHand);
      
//       if (playerValue === 21) {
//         if (dealerValue === 21) {
//           setGameResult('tie');
//           setChips(c => c + currentBet);
//         } else {
//           setGameResult('blackjack');
//           setChips(c => c + Math.floor(currentBet * 2.5));
//         }
//         setGameState('game-over');
//       }
//     }
//   }, [gameState, playerHand, dealerHand, currentBet]);

//   // Dealer AI
//   useEffect(() => {
//     if (gameState === 'dealer-turn') {
//       const dealerValue = calculateHandValue(dealerHand);
      
//       if (dealerValue >= 17) {
//         determineWinner();
//       } else {
//         const timer = setTimeout(() => {
//           if (deck.length > 0) {
//             const newCard = deck[0];
//             const newDeck = deck.slice(1);
//             setDealerHand(prev => [...prev, newCard]);
//             setDeck(newDeck);
//           }
//         }, 1000);
//         return () => clearTimeout(timer);
//       }
//     }
//   }, [gameState, dealerHand, deck]);

//   function CardComponent({ card }: { card: Card }) {
//     const suitSymbols: Record<string, string> = {
//       'Hearts': '♥',
//       'Diamonds': '♦',
//       'Clubs': '♣',
//       'Spades': '♠'
//     };
    
//     const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
    
//     return (
//       <motion.div
//         initial={{ scale: 0, rotate: -180 }}
//         animate={{ scale: 1, rotate: 0 }}
//         transition={{ duration: 0.5 }}
//         className="border-2 border-gray-300 rounded-lg w-20 h-28 bg-white flex flex-col items-center justify-center shadow-lg"
//       >
//         <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
//           {card.value}
//         </div>
//         <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
//           {suitSymbols[card.suit]}
//         </div>
//       </motion.div>
//     );
//   }

//   const handleHit = () => {
//     if (deck.length === 0) return;
    
//     const newCard = deck[0];
//     const newDeck = deck.slice(1);
//     const newPlayerHand = [...playerHand, newCard];
    
//     setPlayerHand(newPlayerHand);
//     setDeck(newDeck);
    
//     const newHandValue = calculateHandValue(newPlayerHand);
//     if (newHandValue > 21) {
//       setGameResult('lose');
//       setGameState('game-over');
//     }
//   };

//   const placeBet = () => {
//     const bet = Number(betInput);
//     if (bet > 0 && bet <= chips) {
//       setCurrentBet(bet);
//       setChips(chips - bet);
//       setBetInput('');
//       startGame();
//     }
//   };

//   const determineWinner = () => {
//     const playerValue = calculateHandValue(playerHand);
//     const dealerValue = calculateHandValue(dealerHand);
    
//     if (dealerValue > 21) {
//       setGameResult('win');
//       setChips(c => c + currentBet * 2);
//     } else if (playerValue > dealerValue) {
//       setGameResult('win');
//       setChips(c => c + currentBet * 2);
//     } else if (dealerValue > playerValue) {
//       setGameResult('lose');
//     } else {
//       setGameResult('tie');
//       setChips(c => c + currentBet);
//     }
    
//     setGameState('game-over');
//   };

//   const handleStand = () => {
//     setGameState('dealer-turn');
//   };

//   function startGame() {
//     const newDeck = shuffleDeck(createDeck());
//     const game = initialDeal(newDeck);

//     setPlayerHand(game.playerHand);
//     setDealerHand(game.dealerHand);
//     setDeck(game.remainingDeck);
//     setGameState('player-turn');
//   }

//   function CoinIcon() {
//     return (
//       <svg className="w-6 h-6 inline-block mr-2" fill="gold" viewBox="0 0 24 24">
//         <circle cx="12" cy="12" r="10" stroke="goldenrod" strokeWidth="2" fill="gold"/>
//         <text x="12" y="16" textAnchor="middle" fontSize="12" fill="darkgoldenrod" fontWeight="bold">$</text>
//       </svg>
//     );
//   }

//   const newGame = () => {
//     setGameState('waiting');
//     setCurrentBet(0);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 text-white p-8">
//       <h1 className="text-5xl font-bold text-center mb-8 text-yellow-400">♠ BLACKJACK ♥</h1>
      
//       {/* Chips and Betting */}
//       <div className="text-center mb-8">
//         <h2 className="text-3xl mb-4 font-semibold">
//           <CoinIcon/> {chips}
//         </h2>
//         {gameState === 'waiting' && (
//           <div className="flex justify-center items-center gap-4">
//             <input 
//               type="number" 
//               value={betInput} 
//               onChange={(e) => setBetInput(e.target.value)}
//               placeholder="Enter bet amount"
//               min="1"
//               max={chips}
//               className="border-2 border-yellow-600 p-3 rounded-lg text-black w-48 text-lg"
//             />
//             <button 
//               onClick={placeBet}
//               disabled={!betInput || Number(betInput) <= 0 || Number(betInput) > chips}
//               className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
//             >
//               Place Bet
//             </button>
//           </div>
//         )}
//         {gameState !== 'waiting' && (
//           <div className="text-2xl font-semibold">
//             Current Bet: <span className="text-yellow-400">${currentBet}</span>
//           </div>
//         )}
//       </div>

//       {/* Game Area */}
//       {gameState !== 'waiting' && (
//         <div className="flex flex-col items-center gap-12">
//           {/* Dealer Section */}
//           <div className="text-center">
//             <h2 className="text-3xl mb-4 font-semibold">
//               Dealer: <span className="text-yellow-400">
//                 {gameState === 'player-turn' ? '?' : calculateHandValue(dealerHand)}
//               </span>
//             </h2>
//             <div className="flex gap-4 justify-center">
//               {dealerHand.map((card, index) => (
//                 <div key={`dealer-${index}`}>
//                   {index === 1 && gameState === 'player-turn' ? (
//                     <motion.div 
//                       initial={{ scale: 0, rotate: -180 }}
//                       animate={{ scale: 1, rotate: 0 }}
//                       transition={{ duration: 0.5 }}
//                       className="border-2 border-gray-300 rounded-lg w-20 h-28 bg-blue-600 flex items-center justify-center shadow-lg"
//                     >
//                       <div className="text-4xl">🂠</div>
//                     </motion.div>
//                   ) : (
//                     <CardComponent card={card} />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Buttons */}
//           {gameState === 'player-turn' && (
//             <div className="flex gap-6">
//               <button 
//                 onClick={handleHit}
//                 className="bg-red-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-red-500 transition-colors text-xl"
//               >
//                 Hit
//               </button>
//               <button 
//                 onClick={handleStand}
//                 className="bg-yellow-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-yellow-500 transition-colors text-xl"
//               >
//                 Stand
//               </button>
//             </div>
//           )}

//           {/* Player Section */}
//           <div className="text-center">
//             <h2 className="text-3xl mb-4 font-semibold">
//               You: <span className="text-yellow-400">{calculateHandValue(playerHand)}</span>
//             </h2>
//             <div className="flex gap-4 justify-center">
//               {playerHand.map((card, index) => (
//                 <CardComponent key={`player-${index}`} card={card} />
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Game Result */}
//       {gameState === 'game-over' && (
//         <div className="text-center mt-8">
//           <div className="text-4xl font-bold mb-6">
//             {gameResult === 'blackjack' && (
//               <div className="text-yellow-300">🎉 BLACKJACK! +${Math.floor(currentBet * 1.5)}</div>
//             )}
//             {gameResult === 'win' && (
//               <div className="text-green-400">🎊 You Win! +${currentBet}</div>
//             )}
//             {gameResult === 'lose' && (
//               <div className="text-red-400">😞 You Lose! -${currentBet}</div>
//             )}
//             {gameResult === 'tie' && (
//               <div className="text-yellow-400">🤝 Push! Bet Returned</div>
//             )}
//           </div>
//           <button
//             onClick={newGame}
//             className="bg-green-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-green-500 transition-colors text-xl"
//           >
//             New Game
//           </button>
//         </div>
//       )}
      
//       {chips === 0 && gameState === 'waiting' && (
//         <div className="text-center mt-8">
//           <div className="text-4xl font-bold text-red-400 mb-4">
//             Out of Chips!
//           </div>
//           <button
//             onClick={() => setChips(1000)}
//             className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-blue-500 transition-colors text-xl"
//           >
//             Reset Chips
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
