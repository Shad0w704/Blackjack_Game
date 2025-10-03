// 'use client';

// import { create } from 'domain';
// import { Card, createDeck, shuffleDeck, initialDeal, calculateHandValue } from '@/lib/game';
// import { start } from 'repl';
// import { motion } from 'framer-motion';
// import { useState, useEffect } from 'react';


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
//                       className="border-2 border-gray-300 rounded-lg w-20 h-28 bg-green-900 flex items-center justify-center shadow-lg"
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



// 'use client';

// import { motion } from 'framer-motion';
// import { useState, useEffect } from 'react';

// // Types
// type Card = {
//   suit: 'Diamonds' | 'Spades' | 'Hearts' | 'Clubs';
//   value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
// }

// type GameHistory = {
//   date: string;
//   bet: number;
//   playerScore: number;
//   dealerScore: number;
//   result: 'win' | 'lose' | 'tie' | 'blackjack';
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
//   const [showChipMenu, setShowChipMenu] = useState(false);
//   const [cardCount, setCardCount] = useState(0);
//   const [history, setHistory] = useState<GameHistory[]>([]);
//   const [showHistory, setShowHistory] = useState(false);
//   const [displayPlayerValue, setDisplayPlayerValue] = useState(0);
//   const [displayDealerValue, setDisplayDealerValue] = useState(0);

//   useEffect(() => {
//     if (gameState === 'waiting') {
//       setPlayerHand([]);
//       setDealerHand([]);
//       setDeck([]);
//       setGameResult('');
//       setCardCount(0);
//       setDisplayPlayerValue(0);
//       setDisplayDealerValue(0);
//     }
//   }, [gameState]);

//   // Update player value display with delay
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDisplayPlayerValue(calculateHandValue(playerHand));
//     }, 200);
//     return () => clearTimeout(timer);
//   }, [playerHand]);

//   // Update dealer value display with delay
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDisplayDealerValue(calculateHandValue(dealerHand));
//     }, 200);
//     return () => clearTimeout(timer);
//   }, [dealerHand]);

//   // Check for blackjack on initial deal
//   useEffect(() => {
//     if (gameState === 'player-turn' && playerHand.length === 2) {
//       const playerValue = calculateHandValue(playerHand);
//       const dealerValue = calculateHandValue(dealerHand);
      
//       if (playerValue === 21) {
//         let result: 'tie' | 'blackjack' = 'blackjack';
//         if (dealerValue === 21) {
//           result = 'tie';
//           setGameResult('tie');
//           setChips(c => c + currentBet);
//         } else {
//           result = 'blackjack';
//           setGameResult('blackjack');
//           setChips(c => c + Math.floor(currentBet * 2.5));
//         }
        
//         // Add to history
//         const gameRecord: GameHistory = {
//           date: new Date().toLocaleString(),
//           bet: currentBet,
//           playerScore: playerValue,
//           dealerScore: dealerValue,
//           result: result
//         };
//         setHistory(prev => [gameRecord, ...prev]);
        
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
//             setCardCount(c => c + 1);
//           }
//         }, 1000);
//         return () => clearTimeout(timer);
//       }
//     }
//   }, [gameState, dealerHand, deck]);

//   function CardComponent({ card, animate }: { card: Card; animate: boolean }) {
//     const suitSymbols: Record<string, string> = {
//       'Hearts': '♥',
//       'Diamonds': '♦',
//       'Clubs': '♣',
//       'Spades': '♠'
//     };
    
//     const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
    
//     if (animate) {
//       return (
//         <motion.div
//           initial={{ y: -30, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.2, ease: "easeOut" }}
//           className="border-2 border-gray-300 rounded-lg w-20 h-28 bg-white flex flex-col items-center justify-center shadow-lg"
//         >
//           <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
//             {card.value}
//           </div>
//           <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
//             {suitSymbols[card.suit]}
//           </div>
//         </motion.div>
//       );
//     }
    
//     return (
//       <div className="border-2 border-gray-300 rounded-lg w-20 h-28 bg-white flex flex-col items-center justify-center shadow-lg">
//         <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
//           {card.value}
//         </div>
//         <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
//           {suitSymbols[card.suit]}
//         </div>
//       </div>
//     );
//   }

//   const handleHit = () => {
//     if (deck.length === 0) return;
    
//     const newCard = deck[0];
//     const newDeck = deck.slice(1);
//     const newPlayerHand = [...playerHand, newCard];
    
//     setPlayerHand(newPlayerHand);
//     setDeck(newDeck);
//     setCardCount(c => c + 1);
    
//     const newHandValue = calculateHandValue(newPlayerHand);
//     if (newHandValue > 21) {
//       setGameResult('lose');
//       setGameState('game-over');
      
//       // Add to history for bust
//       const gameRecord: GameHistory = {
//         date: new Date().toLocaleString(),
//         bet: currentBet,
//         playerScore: newHandValue,
//         dealerScore: calculateHandValue(dealerHand),
//         result: 'lose'
//       };
//       setHistory(prev => [gameRecord, ...prev]);
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
    
//     let result: 'win' | 'lose' | 'tie' = 'lose';
    
//     if (dealerValue > 21) {
//       result = 'win';
//       setGameResult('win');
//       setChips(c => c + currentBet * 2);
//     } else if (playerValue > dealerValue) {
//       result = 'win';
//       setGameResult('win');
//       setChips(c => c + currentBet * 2);
//     } else if (dealerValue > playerValue) {
//       result = 'lose';
//       setGameResult('lose');
//     } else {
//       result = 'tie';
//       setGameResult('tie');
//       setChips(c => c + currentBet);
//     }
    
//     // Add to history
//     const gameRecord: GameHistory = {
//       date: new Date().toLocaleString(),
//       bet: currentBet,
//       playerScore: playerValue,
//       dealerScore: dealerValue,
//       result: result
//     };
//     setHistory(prev => [gameRecord, ...prev]);
    
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
//     setCardCount(4);
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
//       <h1 className="text-5xl font-bold text-center mb-4 text-yellow-400">♠ BLACKJACK ♥</h1>
      
//       {/* Buy Chips Button */}
//       <div className="flex justify-center gap-4 mb-6">
//         <button 
//           onClick={() => setShowChipMenu(!showChipMenu)} 
//           className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-500 transition-colors"
//         >
//           {showChipMenu ? 'Close' : 'Buy Chips'}
//         </button>
//         <button 
//           onClick={() => setShowHistory(!showHistory)} 
//           className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors"
//         >
//           {showHistory ? 'Close History' : 'Game History'}
//         </button>
//       </div>

//       {/* Buy Chips Menu */}
//       {showChipMenu && (
//         <motion.div 
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex justify-center gap-3 mb-6"
//         >
//           <button onClick={() => setChips(c => c + 100)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
//             +100 Chips
//           </button>
//           <button onClick={() => setChips(c => c + 500)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
//             +500 Chips
//           </button>
//           <button onClick={() => setChips(c => c + 1000)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
//             +1000 Chips
//           </button>
//           <button onClick={() => setChips(c => c + 5000)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
//             +5000 Chips
//           </button>
//         </motion.div>
//       )}

//       {/* Game History */}
//       {showHistory && (
//         <motion.div 
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-4xl mx-auto mb-6 bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto"
//         >
//           <h3 className="text-2xl font-bold mb-4 text-center text-yellow-400">Game History</h3>
//           {history.length === 0 ? (
//             <p className="text-center text-gray-400">No games played yet</p>
//           ) : (
//             <div className="space-y-2">
//               {history.map((game, index) => (
//                 <div key={index} className="bg-gray-700 rounded p-3 flex justify-between items-center">
//                   <div className="text-sm text-gray-300">{game.date}</div>
//                   <div className="flex gap-6 items-center">
//                     <div className="text-sm">
//                       <span className="text-gray-400">Bet:</span> <span className="text-yellow-400 font-semibold">${game.bet}</span>
//                     </div>
//                     <div className="text-sm">
//                       <span className="text-gray-400">Score:</span> <span className="font-semibold">{game.playerScore}</span> vs <span className="font-semibold">{game.dealerScore}</span>
//                     </div>
//                     <div className={`font-bold text-sm px-3 py-1 rounded ${
//                       game.result === 'win' || game.result === 'blackjack' 
//                         ? 'bg-green-600 text-white' 
//                         : game.result === 'lose' 
//                         ? 'bg-red-600 text-white' 
//                         : 'bg-yellow-600 text-white'
//                     }`}>
//                       {game.result === 'blackjack' ? 'BLACKJACK!' : game.result.toUpperCase()}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </motion.div>
//       )}
      
//       {/* Chips and Betting */}
//       <div className={`${gameState === 'waiting' ? 'mt-8' : ''}`}>
//         {gameState === 'waiting' ? (
//           <div className="flex flex-col items-center">
//             {/* Chip display in top right */}
//             <div className="fixed top-8 right-8">
//               <h2 className="text-3xl font-semibold">
//                 <CoinIcon/> {chips}
//               </h2>
//             </div>

//             {/* Card placeholders */}
//             <div className="flex flex-col items-center gap-12 mb-12">
//               {/* Dealer placeholder */}
//               <div className="text-center">
//                 <h2 className="text-3xl mb-4 font-semibold text-gray-400">Dealer</h2>
//                 <div className="flex gap-4 justify-center">
//                   <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
//                   <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
//                 </div>
//               </div>

//               {/* Player placeholder */}
//               <div className="text-center">
//                 <h2 className="text-3xl mb-4 font-semibold text-gray-400">You</h2>
//                 <div className="flex gap-4 justify-center">
//                   <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
//                   <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
//                 </div>
//               </div>
//             </div>

//             {/* Betting section at bottom */}
//             <div className="flex flex-col items-center gap-4">
//               <div className="flex items-center gap-4">
//                 <input 
//                   type="number" 
//                   value={betInput} 
//                   onChange={(e) => setBetInput(e.target.value)}
//                   placeholder="Enter bet amount"
//                   min="1"
//                   max={chips}
//                   className="border-2 border-yellow-600 p-3 rounded-lg text-black w-48 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                 />
//                 <button 
//                   onClick={placeBet}
//                   disabled={!betInput || Number(betInput) <= 0 || Number(betInput) > chips}
//                   className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
//                 >
//                   Place Bet
//                 </button>
//               </div>
//               <div className="flex gap-3">
//                 <button 
//                   onClick={() => setBetInput('5')}
//                   disabled={chips < 5}
//                   className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
//                 >
//                   $5
//                 </button>
//                 <button 
//                   onClick={() => setBetInput('25')}
//                   disabled={chips < 25}
//                   className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
//                 >
//                   $25
//                 </button>
//                 <button 
//                   onClick={() => setBetInput('100')}
//                   disabled={chips < 100}
//                   className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
//                 >
//                   $100
//                 </button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="text-center mb-8">
//             <h2 className="text-3xl mb-4 font-semibold">
//               <CoinIcon/> {chips}
//             </h2>
//             <div className="text-2xl font-semibold">
//               Current Bet: <span className="text-yellow-400">${currentBet}</span>
//             </div>
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
//                 {gameState === 'player-turn' ? '?' : displayDealerValue}
//               </span>
//             </h2>
//             <div className="flex gap-4 justify-center">
//               {dealerHand.map((card, index) => (
//                 <div key={`dealer-${index}`}>
//                   {index === 1 && gameState === 'player-turn' ? (
//                     <motion.div 
//                       initial={{ y: -30, opacity: 0 }}
//                       animate={{ y: 0, opacity: 1 }}
//                       transition={{ duration: 0.2, ease: "easeOut" }}
//                       className="border-2 border-gray-300 rounded-lg w-20 h-28 bg-blue-600 flex items-center justify-center shadow-lg"
//                     >
//                       <div className="text-4xl">🂠</div>
//                     </motion.div>
//                   ) : (
//                     <CardComponent card={card} animate={index >= 2 && index === dealerHand.length - 1} />
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
//             <h2 className="text-3xl mb-4 font-semibold flex items-center justify-center gap-3">
//               <span>You: <span className="text-yellow-400">{displayPlayerValue}</span></span>
//               {gameState === 'game-over' && (
//                 <span className={`font-bold text-sm px-3 py-1 rounded ${
//                   gameResult === 'win' || gameResult === 'blackjack' 
//                     ? 'bg-green-600 text-white' 
//                     : gameResult === 'lose' 
//                     ? 'bg-red-600 text-white' 
//                     : 'bg-yellow-600 text-white'
//                 }`}>
//                   {gameResult === 'blackjack' ? 'BLACKJACK!' : gameResult === 'win' ? 'WIN' : gameResult === 'lose' ? 'LOSE' : 'PUSH'}
//                 </span>
//               )}
//             </h2>
//             <div className="flex gap-4 justify-center">
//               {playerHand.map((card, index) => {
//                 const isNewCard = (index >= 2) && (index === playerHand.length - 1);
//                 return <CardComponent key={`player-${index}`} card={card} animate={isNewCard} />;
//               })}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Game Result */}
//       {gameState === 'game-over' && (
//         <div className="fixed bottom-32 left-0 right-0 text-center">
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







'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

// Types
type Card = {
  suit: 'Diamonds' | 'Spades' | 'Hearts' | 'Clubs';
  value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

type GameHistory = {
  date: string;
  bet: number;
  playerScore: number;
  dealerScore: number;
  result: 'win' | 'lose' | 'tie' | 'blackjack';
}

// Game functions
function createDeck(): Card[] {
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

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateHandValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.value === 'A') {
      total += 11;
      aces++;
    } else if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
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

function initialDeal(deck: Card[]): {
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

function CardComponent({ card, animate, slideFrom }: { card: Card; animate: boolean; slideFrom: 'top' | 'bottom' }) {
  const suitSymbols: Record<string, string> = {
    'Hearts': '♥',
    'Diamonds': '♦',
    'Clubs': '♣',
    'Spades': '♠'
  };
  
  const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
  
  if (animate) {
    const initialY = slideFrom === 'top' ? -100 : 100;
    
    return (
      <motion.div
        initial={{ y: initialY, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-2 border-gray-300 rounded-lg w-20 h-28 bg-white flex flex-col items-center justify-center shadow-lg"
      >
        <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.value}
        </div>
        <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
          {suitSymbols[card.suit]}
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className="border-2 border-gray-300 rounded-lg w-20 h-28 bg-white flex flex-col items-center justify-center shadow-lg">
      <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
        {card.value}
      </div>
      <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
        {suitSymbols[card.suit]}
      </div>
    </div>
  );
}

function CoinIcon() {
  return (
    <svg className="w-6 h-6 inline-block mr-2" fill="gold" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="goldenrod" strokeWidth="2" fill="gold"/>
      <text x="12" y="16" textAnchor="middle" fontSize="12" fill="darkgoldenrod" fontWeight="bold">$</text>
    </svg>
  );
}

export default function BlackjackGame() {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'waiting' | 'player-turn' | 'dealer-turn' | 'game-over'>('waiting');
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'tie' | 'blackjack' | ''>('');
  const [chips, setChips] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  const [betInput, setBetInput] = useState<string>('');
  const [currentMenu, setCurrentMenu] = useState<'game' | 'chips' | 'history'>('game');
  const [cardCount, setCardCount] = useState(0);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [displayPlayerValue, setDisplayPlayerValue] = useState(0);
  const [displayDealerValue, setDisplayDealerValue] = useState(0);

  const determineWinner = useCallback(() => {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    let result: 'win' | 'lose' | 'tie' = 'lose';
    
    if (dealerValue > 21) {
      result = 'win';
      setGameResult('win');
      setChips(c => c + currentBet * 2);
    } else if (playerValue > dealerValue) {
      result = 'win';
      setGameResult('win');
      setChips(c => c + currentBet * 2);
    } else if (dealerValue > playerValue) {
      result = 'lose';
      setGameResult('lose');
    } else {
      result = 'tie';
      setGameResult('tie');
      setChips(c => c + currentBet);
    }
    
    // Add to history
    const gameRecord: GameHistory = {
      date: new Date().toLocaleString(),
      bet: currentBet,
      playerScore: playerValue,
      dealerScore: dealerValue,
      result: result
    };
    setHistory(prev => [gameRecord, ...prev]);
    
    setGameState('game-over');
  }, [playerHand, dealerHand, currentBet]);

  useEffect(() => {
    if (gameState === 'waiting') {
      setPlayerHand([]);
      setDealerHand([]);
      setDeck([]);
      setGameResult('');
      setCardCount(0);
      setDisplayPlayerValue(0);
      setDisplayDealerValue(0);
    }
  }, [gameState]);

  // Update player value display with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPlayerValue(calculateHandValue(playerHand));
    }, 200);
    return () => clearTimeout(timer);
  }, [playerHand]);

  // Update dealer value display with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayDealerValue(calculateHandValue(dealerHand));
    }, 200);
    return () => clearTimeout(timer);
  }, [dealerHand]);

  // Check for blackjack on initial deal
  useEffect(() => {
    if (gameState === 'player-turn' && playerHand.length === 2) {
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);
      
      if (playerValue === 21) {
        let result: 'tie' | 'blackjack' = 'blackjack';
        if (dealerValue === 21) {
          result = 'tie';
          setGameResult('tie');
          setChips(c => c + currentBet);
        } else {
          result = 'blackjack';
          setGameResult('blackjack');
          setChips(c => c + Math.floor(currentBet * 2.5));
        }
        
        // Add to history
        const gameRecord: GameHistory = {
          date: new Date().toLocaleString(),
          bet: currentBet,
          playerScore: playerValue,
          dealerScore: dealerValue,
          result: result
        };
        setHistory(prev => [gameRecord, ...prev]);
        
        setGameState('game-over');
      }
    }
  }, [gameState, playerHand, dealerHand, currentBet]);

  // Dealer AI
  useEffect(() => {
    if (gameState === 'dealer-turn') {
      const dealerValue = calculateHandValue(dealerHand);
      
      if (dealerValue >= 17) {
        determineWinner();
      } else {
        const timer = setTimeout(() => {
          if (deck.length > 0) {
            const newCard = deck[0];
            const newDeck = deck.slice(1);
            setDealerHand(prev => [...prev, newCard]);
            setDeck(newDeck);
            setCardCount(c => c + 1);
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, dealerHand, deck, determineWinner]);

  const handleHit = () => {
    if (deck.length === 0) return;
    
    const newCard = deck[0];
    const newDeck = deck.slice(1);
    const newPlayerHand = [...playerHand, newCard];
    
    setPlayerHand(newPlayerHand);
    setDeck(newDeck);
    setCardCount(c => c + 1);
    
    const newHandValue = calculateHandValue(newPlayerHand);
    if (newHandValue > 21) {
      setGameResult('lose');
      setGameState('game-over');
      
      // Add to history for bust
      const gameRecord: GameHistory = {
        date: new Date().toLocaleString(),
        bet: currentBet,
        playerScore: newHandValue,
        dealerScore: calculateHandValue(dealerHand),
        result: 'lose'
      };
      setHistory(prev => [gameRecord, ...prev]);
    }
  };

  const placeBet = () => {
    const bet = Number(betInput);
    if (bet > 0 && bet <= chips) {
      setCurrentBet(bet);
      setChips(chips - bet);
      setBetInput('');
      startGame();
    }
  };

  const handleStand = () => {
    setGameState('dealer-turn');
  };

  function startGame() {
    const newDeck = shuffleDeck(createDeck());
    const game = initialDeal(newDeck);

    setPlayerHand(game.playerHand);
    setDealerHand(game.dealerHand);
    setDeck(game.remainingDeck);
    setGameState('player-turn');
    setCardCount(4);
  }

  const newGame = () => {
    setGameState('waiting');
    setCurrentBet(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 text-white p-8">
      {/* Chip count - always in top right */}
      <div className="fixed top-8 right-8">
        <h2 className="text-3xl font-semibold">
          <CoinIcon /> {chips}
        </h2>
      </div>

      <h1 className="text-5xl font-bold text-center mb-4 text-yellow-400">♠ BLACKJACK ♥</h1>
      
      {/* Menu buttons */}
      {currentMenu === 'game' && (
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setCurrentMenu('chips')} 
            className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-500 transition-colors"
          >
            Buy Chips
          </button>
          <button 
            onClick={() => setCurrentMenu('history')} 
            className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Game History
          </button>
        </div>
      )}

      {/* Buy Chips Menu */}
      {currentMenu === 'chips' && (
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setCurrentMenu('game')}
            className="mb-8 text-white hover:text-red-400 text-5xl font-bold"
          >
            ×
          </button>
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">Buy Chips</h2>
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => setChips(c => c + 100)} 
              className="bg-blue-600 text-white font-bold px-12 py-8 rounded-lg hover:bg-blue-500 transition-colors text-2xl"
            >
              +100 Chips
            </button>
            <button 
              onClick={() => setChips(c => c + 500)} 
              className="bg-blue-600 text-white font-bold px-12 py-8 rounded-lg hover:bg-blue-500 transition-colors text-2xl"
            >
              +500 Chips
            </button>
            <button 
              onClick={() => setChips(c => c + 1000)} 
              className="bg-blue-600 text-white font-bold px-12 py-8 rounded-lg hover:bg-blue-500 transition-colors text-2xl"
            >
              +1000 Chips
            </button>
            <button 
              onClick={() => setChips(c => c + 5000)} 
              className="bg-blue-600 text-white font-bold px-12 py-8 rounded-lg hover:bg-blue-500 transition-colors text-2xl"
            >
              +5000 Chips
            </button>
          </div>
        </div>
      )}

      {/* Game History Menu */}
      {currentMenu === 'history' && (
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setCurrentMenu('game')}
            className="mb-8 text-white hover:text-red-400 text-5xl font-bold"
          >
            ×
          </button>
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">Game History</h2>
          <div className="max-w-4xl w-full bg-gray-800 rounded-lg p-6 max-h-[60vh] overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-center text-gray-400 text-xl">No games played yet</p>
            ) : (
              <div className="space-y-3">
                {history.map((game, index) => (
                  <div key={index} className="bg-gray-700 rounded p-4 flex justify-between items-center">
                    <div className="text-base text-gray-300">{game.date}</div>
                    <div className="flex gap-8 items-center">
                      <div className="text-base">
                        <span className="text-gray-400">Bet:</span> <span className="text-yellow-400 font-semibold">${game.bet}</span>
                      </div>
                      <div className="text-base">
                        <span className="text-gray-400">Score:</span> <span className="font-semibold">{game.playerScore}</span> vs <span className="font-semibold">{game.dealerScore}</span>
                      </div>
                      <div className={`font-bold text-base px-4 py-2 rounded ${
                        game.result === 'win' || game.result === 'blackjack' 
                          ? 'bg-green-600 text-white' 
                          : game.result === 'lose' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {game.result === 'blackjack' ? 'BLACKJACK!' : game.result.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Game Content */}
      {currentMenu === 'game' && (
        <div className="mt-8 flex flex-col items-center gap-8">
          {gameState === 'waiting' ? (
            <>
              {/* Dealer placeholder */}
              <div className="text-center">
                <h2 className="text-3xl mb-4 font-semibold text-gray-400">Dealer</h2>
                <div className="flex gap-4 justify-center">
                  <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
                  <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
                </div>
              </div>

              {/* Player placeholder */}
              <div className="text-center">
                <h2 className="text-3xl mb-4 font-semibold text-gray-400">You</h2>
                <div className="flex gap-4 justify-center">
                  <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
                  <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
                </div>
              </div>

              {/* Betting section - MOVED BELOW PLAYER */}
              <div className="flex flex-col items-center gap-4 mt-4">
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    value={betInput} 
                    onChange={(e) => setBetInput(e.target.value)}
                    placeholder="Enter bet amount"
                    min="1"
                    max={chips}
                    className="border-2 border-yellow-600 p-3 rounded-lg text-black w-48 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button 
                    onClick={placeBet}
                    disabled={!betInput || Number(betInput) <= 0 || Number(betInput) > chips}
                    className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    Place Bet
                  </button>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setBetInput('5')}
                    disabled={chips < 5}
                    className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    $5
                  </button>
                  <button 
                    onClick={() => setBetInput('25')}
                    disabled={chips < 25}
                    className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    $25
                  </button>
                  <button 
                    onClick={() => setBetInput('100')}
                    disabled={chips < 100}
                    className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    $100
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Dealer Section */}
              <div className="text-center">
                <h2 className="text-3xl mb-4 font-semibold">
                  Dealer: <span className="text-yellow-400">
                    {gameState === 'player-turn' ? '?' : displayDealerValue}
                  </span>
                </h2>
                <div className="flex gap-4 justify-center">
                  {dealerHand.map((card, index) => (
                    <div key={`dealer-${index}`}>
                      {index === 1 && gameState === 'player-turn' ? (
                        <motion.div 
                          initial={{ y: -100, opacity: 0, scale: 0.8 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="border-2 border-gray-300 rounded-lg w-20 h-28 bg-blue-600 flex items-center justify-center shadow-lg"
                        >
                          <div className="text-4xl">🂠</div>
                        </motion.div>
                      ) : (
                        <CardComponent 
                          card={card} 
                          animate={index >= 2 && index === dealerHand.length - 1} 
                          slideFrom="top" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Section */}
              <div className="text-center">
                <h2 className="text-3xl mb-4 font-semibold flex items-center justify-center gap-3">
                  <span>You: <span className="text-yellow-400">{displayPlayerValue}</span></span>
                  {gameState === 'game-over' && (
                    <span className={`font-bold text-sm px-3 py-1 rounded ${
                      gameResult === 'win' || gameResult === 'blackjack' 
                        ? 'bg-green-600 text-white' 
                        : gameResult === 'lose' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {gameResult === 'blackjack' ? 'BLACKJACK!' : gameResult === 'win' ? 'WIN' : gameResult === 'lose' ? 'LOSE' : 'PUSH'}
                    </span>
                  )}
                </h2>
                <div className="flex gap-4 justify-center">
                  {playerHand.map((card, index) => {
                    const isNewCard = (index >= 2) && (index === playerHand.length - 1);
                    return (
                      <CardComponent 
                        key={`player-${index}`} 
                        card={card} 
                        animate={isNewCard} 
                        slideFrom="bottom" 
                      />
                    );
                  })}
                </div>
              </div>

              {/* Game Actions */}
              {gameState === 'player-turn' && (
                <div className="flex gap-6 mt-4">
                  <button 
                    onClick={handleHit}
                    className="bg-red-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-red-500 transition-colors text-xl"
                  >
                    Hit
                  </button>
                  <button 
                    onClick={handleStand}
                    className="bg-yellow-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-yellow-500 transition-colors text-xl"
                  >
                    Stand
                  </button>
                </div>
              )}
            </>
          )}

          {/* Current bet at bottom during game */}
          {gameState !== 'waiting' && (
            <div className="fixed bottom-8 left-0 right-0 text-center">
              <div className="text-2xl font-semibold">
                Current Bet: <span className="text-yellow-400">${currentBet}</span>
              </div>
            </div>
          )}

          {/* Game Result */}
          {gameState === 'game-over' && (
            <div className="fixed bottom-24 left-0 right-0 text-center">
              <button
                onClick={newGame}
                className="bg-green-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-green-500 transition-colors text-xl"
              >
                New Game
              </button>
            </div>
          )}
          
          {chips === 0 && gameState === 'waiting' && (
            <div className="text-center mt-8">
              <div className="text-4xl font-bold text-red-400 mb-4">
                Out of Chips!
              </div>
              <button
                onClick={() => setChips(1000)}
                className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-blue-500 transition-colors text-xl"
              >
                Reset Chips
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



