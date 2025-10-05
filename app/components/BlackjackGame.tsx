'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from './AuthForm';

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

function CardComponent({ card, animate, slideFrom, isMobile }: { card: Card; animate: boolean; slideFrom: 'top' | 'bottom'; isMobile: boolean }) {
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
        className={`border-2 border-gray-300 rounded-lg ${
          isMobile ? 'w-12 h-18' : 'w-20 h-28'  // Changed from w-14 h-20 to w-12 h-18
        } bg-white flex flex-col items-center justify-center shadow-lg`}
      >
        <div className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold ${isRed ? 'text-red-600' : 'text-black'}`}> {/* text-base instead of text-lg */}
          {card.value}
        </div>
        <div className={`${isMobile ? 'text-lg' : 'text-3xl'} ${isRed ? 'text-red-600' : 'text-black'}`}> {/* text-lg instead of text-xl */}
          {suitSymbols[card.suit]}
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className={`border-2 border-gray-300 rounded-lg ${
      isMobile ? 'w-12 h-18' : 'w-20 h-28'  // Changed from w-14 h-20 to w-12 h-18
    } bg-white flex flex-col items-center justify-center shadow-lg`}>
      <div className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
        {card.value}
      </div>
      <div className={`${isMobile ? 'text-lg' : 'text-3xl'} ${isRed ? 'text-red-600' : 'text-black'}`}>
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
  const { user, isGuest, signOut } = useAuth();
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'waiting' | 'player-turn' | 'dealer-turn' | 'game-over'>('waiting');
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'tie' | 'blackjack' | ''>('');
  const [chips, setChips] = useState(500);
  const [currentBet, setCurrentBet] = useState(0);
  const [betInput, setBetInput] = useState<string>('');
  const [currentMenu, setCurrentMenu] = useState<'game' | 'chips' | 'history'>('game');
  const [cardCount, setCardCount] = useState(0);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [displayPlayerValue, setDisplayPlayerValue] = useState(0);
  const [displayDealerValue, setDisplayDealerValue] = useState(0);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{ action: string; reason: string } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [highlightButton, setHighlightButton] = useState<'hit' | 'stand' | null>(null);

  // Load user chips from database
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('chips, username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user data:', error);
      } else if (data) {
        setChips(data.chips || 500);
      }
    };

    loadUserData();
  }, [user]);

  // Load game history from database
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;

      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading history:', error);
      } else if (data) {
        const formattedHistory = data.map(game => ({
          date: new Date(game.created_at).toLocaleString(),
          bet: game.bet_amount,
          playerScore: game.player_score,
          dealerScore: game.dealer_score,
          result: game.result as 'win' | 'lose' | 'tie' | 'blackjack'
        }));
        setHistory(formattedHistory);
      }
    };

    loadHistory();
  }, [user]);

  const logGameToDatabase = async (result: string, netChips: number) => {
    if (!user) return;

    try {
      const supabase = createSupabaseClient();
      
      const { error } = await supabase
        .from('game_sessions')
        .insert([
          {
            user_id: user.id,
            bet_amount: currentBet,
            player_score: displayPlayerValue,
            dealer_score: displayDealerValue,
            result: result,
            net_chips: netChips,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Failed to log game:', error);
      }
    } catch (err) {
      console.error('Database error:', err);
    }
  };

  const updateUserChipsInDatabase = async (newChips: number) => {
    if (!user) return;

    try {
      const supabase = createSupabaseClient();
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          chips: newChips,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to update chips:', error);
      }
    } catch (err) {
      console.error('Database error:', err);
    }
  };

  const calculateNetChips = useCallback((result: string): number => {
    switch (result) {
      case 'blackjack':
        return Math.floor(currentBet * 1.5);
      case 'win':
        return currentBet;
      case 'tie':
        return 0;
      case 'lose':
        return -currentBet;
      default:
        return 0;
    }
  }, [currentBet]);

  const determineWinner = useCallback(() => {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    let result: 'win' | 'lose' | 'tie' | 'blackjack' = 'lose';
    let netChips = 0;
    
    if (dealerValue > 21) {
      result = 'win';
      netChips = currentBet;
      setChips(c => c + currentBet * 2);
    } else if (playerValue > dealerValue) {
      result = 'win';
      netChips = currentBet;
      setChips(c => c + currentBet * 2);
    } else if (dealerValue > playerValue) {
      result = 'lose';
      netChips = -currentBet;
    } else {
      result = 'tie';
      netChips = 0;
      setChips(c => c + currentBet);
    }

    const gameRecord: GameHistory = {
      date: new Date().toLocaleString(),
      bet: currentBet,
      playerScore: playerValue,
      dealerScore: dealerValue,
      result: result
    };
    setHistory(prev => [gameRecord, ...prev]);

    logGameToDatabase(result, netChips);
    
    const finalChips = result === 'tie' 
      ? chips + currentBet 
      : result === 'lose' 
      ? chips 
      : chips + currentBet * 2;
    
    updateUserChipsInDatabase(finalChips);
    
    setGameResult(result);
    setGameState('game-over');

    if (isGuest && (result === 'win' || result === 'blackjack')) {
      setShowSavePrompt(true);
    }
  }, [playerHand, dealerHand, currentBet, chips, isGuest, calculateNetChips]);

  useEffect(() => {
    if (gameState === 'waiting') {
      setPlayerHand([]);
      setDealerHand([]);
      setDeck([]);
      setGameResult('');
      setCardCount(0);
      setDisplayPlayerValue(0);
      setDisplayDealerValue(0);
      setAiAdvice(null);
      setHighlightButton(null);
    }
  }, [gameState]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPlayerValue(calculateHandValue(playerHand));
    }, 200);
    return () => clearTimeout(timer);
  }, [playerHand]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayDealerValue(calculateHandValue(dealerHand));
    }, 200);
    return () => clearTimeout(timer);
  }, [dealerHand]);

  useEffect(() => {
    if (gameState === 'player-turn' && playerHand.length === 2) {
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);
      
      if (playerValue === 21) {
        let result: 'tie' | 'blackjack' = 'blackjack';
        let netChips = 0;
        
        if (dealerValue === 21) {
          result = 'tie';
          netChips = 0;
          setChips(c => c + currentBet);
        } else {
          result = 'blackjack';
          netChips = Math.floor(currentBet * 1.5);
          setChips(c => c + currentBet + netChips);
        }
        
        const gameRecord: GameHistory = {
          date: new Date().toLocaleString(),
          bet: currentBet,
          playerScore: playerValue,
          dealerScore: dealerValue,
          result: result
        };
        setHistory(prev => [gameRecord, ...prev]);

        logGameToDatabase(result, netChips);
        
        const finalChips = result === 'tie' 
          ? chips + currentBet 
          : chips + currentBet + netChips;
        
        updateUserChipsInDatabase(finalChips);
        
        setGameResult(result);
        setGameState('game-over');

        if (isGuest && (result === 'blackjack' || result === 'win')) {
          setShowSavePrompt(true);
        }
      }
    }
  }, [gameState, playerHand, dealerHand, currentBet, chips, isGuest]);

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
      const gameRecord: GameHistory = {
        date: new Date().toLocaleString(),
        bet: currentBet,
        playerScore: newHandValue,
        dealerScore: calculateHandValue(dealerHand),
        result: 'lose'
      };
      setHistory(prev => [gameRecord, ...prev]);

      const netChips = -currentBet;
      logGameToDatabase('lose', netChips);
      updateUserChipsInDatabase(chips);
      
      setGameResult('lose');
      setGameState('game-over');
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
    setShowSavePrompt(false);
    setAiAdvice(null);
    setHighlightButton(null);
  };

  const getAIAdvice = async () => {
    if (gameState !== 'player-turn' || loadingAI) return;

    setLoadingAI(true);
    setAiAdvice(null);
    setHighlightButton(null);

    try {
      console.log('Sending AI advice request to /api/blackjack-advice...');
      
      const response = await fetch('/api/blackjack-advice', {  // This is correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerHand: playerHand,
          dealerUpcard: dealerHand[0],
          playerValue: calculateHandValue(playerHand)
        })
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Advice received:', data);
      
      setAiAdvice(data);
      setHighlightButton(data.action === 'HIT' ? 'hit' : 'stand');

      setTimeout(() => {
        setHighlightButton(null);
      }, 5000);

    } catch (error) {
      console.error('Error getting AI advice:', error);
      setAiAdvice({ 
        action: 'ERROR', 
        reason: 'Failed to get advice. Check console for details.' 
      });
    } finally {
      setLoadingAI(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 text-white p-8">
    {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} onSuccess={() => setShowSavePrompt(false)} />}
    
    {/* Mobile: Coins below title, Desktop: Coins top right */}
    <div className="flex flex-col items-center mb-2 mt-8 md:mt-0"> {/* Added mt-8 for mobile spacing */}
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-yellow-400">♠ BLACKJACK ♥</h1>
      
      {/* Mobile chips display */}
      <div className="block md:hidden">
        <h2 className="text-xl font-semibold">
          <CoinIcon /> {chips}
        </h2>
      </div>
    </div>

    {/* Desktop chips and auth buttons */}
    <div className="hidden md:flex fixed top-8 right-8 items-center gap-4">
      <h2 className="text-3xl font-semibold">
        <CoinIcon /> {chips}
      </h2>
      {isGuest ? (
        <button
          onClick={() => setShowAuthForm(true)}
          className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer"
        >
          Sign In
        </button>
      ) : (
        <button
          onClick={signOut}
          className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-500 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      )}
    </div>

    {/* Mobile auth button */}
    <div className="block md:hidden fixed top-4 right-4">
      {isGuest ? (
        <button
          onClick={() => setShowAuthForm(true)}
          className="bg-yellow-500 text-black font-semibold px-3 py-1 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer text-sm"
        >
          Sign In
        </button>
      ) : (
        <button
          onClick={signOut}
          className="bg-red-600 text-white font-semibold px-3 py-1 rounded-lg hover:bg-red-500 transition-colors cursor-pointer text-sm"
        >
          Sign Out
        </button>
      )}
    </div>

    {showSavePrompt && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl shadow-2xl p-8 max-w-md border-4 border-yellow-500">
          <h3 className="text-3xl font-bold text-yellow-400 mb-4 text-center">Great Win!</h3>
          <p className="text-white text-lg mb-6 text-center">
            Sign in to save your progress and chips!
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAuthForm(true)}
              className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowSavePrompt(false)}
              className="flex-1 bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-500 transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    )}

    {/* REMOVED THE DUPLICATE BLACKJACK TITLE THAT WAS HERE */}
    
    {currentMenu === 'game' && (
      <div className="flex justify-center gap-4 mb-6">
        <button 
          onClick={() => setCurrentMenu('chips')} 
          className="text-sm bg-purple-600 text-white font-semibold px-4 py-1 rounded-lg hover:bg-purple-500 transition-colors cursor-pointer"
        >
          Buy Chips
        </button>
        <button 
          onClick={() => setCurrentMenu('history')} 
          className="text-sm bg-indigo-600 text-white font-semibold px-4 py-1 rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer"
        >
          Game History
        </button>
      </div>
    )}

      {currentMenu === 'chips' && (
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setCurrentMenu('game')}
            className="mb-8 text-white hover:text-red-400 text-5xl font-bold cursor-pointer"
          >
            ×
          </button>
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">Buy Chips</h2>
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => {
                const newChips = chips + 100;
                setChips(newChips);
                if (user) updateUserChipsInDatabase(newChips);
              }} 
              className="bg-blue-600 text-white font-bold px-12 py-8 rounded-lg hover:bg-blue-500 transition-colors text-2xl cursor-pointer"
            >
              +100 Chips
            </button>
            <button 
              onClick={() => {
                const newChips = chips + 500;
                setChips(newChips);
                if (user) updateUserChipsInDatabase(newChips);
              }} 
              className="bg-blue-600 text-white font-bold px-12 py-8 rounded-lg hover:bg-blue-500 transition-colors text-2xl cursor-pointer"
            >
              +500 Chips
            </button>
            <button 
              onClick={() => {
                const newChips = chips + 1000;
                setChips(newChips);
                if (user) updateUserChipsInDatabase(newChips);
              }} 
              className="bg-blue-600 text-white font-bold px-12 py-8 rounded-lg hover:bg-blue-500 transition-colors text-2xl cursor-pointer"
            >
              +1000 Chips
            </button>
            <button 
              onClick={() => {
                const newChips = chips + 5000;
                setChips(newChips);
                if (user) updateUserChipsInDatabase(newChips);
              }} 
              className="bg-blue-600 text-white font-bold px-12 py-8 rounded-lg hover:bg-blue-500 transition-colors text-2xl cursor-pointer"
            >
              +5000 Chips
            </button>
          </div>
        </div>
      )}

      {currentMenu === 'history' && (
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setCurrentMenu('game')}
            className="mb-8 text-white hover:text-red-400 text-5xl font-bold cursor-pointer"
          >
            ×
          </button>
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">Game History</h2>
          {isGuest ? (
            <div className="max-w-4xl w-full bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-xl text-gray-300 mb-4">Sign in to view your game history</p>
              <button
                onClick={() => setShowAuthForm(true)}
                className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          ) : (
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
          )}
        </div>
      )}
      
      {currentMenu === 'game' && (
        <div className="mt-8 flex flex-col items-center gap-8">
          {gameState === 'waiting' ? (
            <>
              <div className="text-center">
                <h2 className="text-3xl mb-4 font-semibold text-gray-400">Dealer</h2>
                <div className="flex gap-4 justify-center">
                  <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
                  <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-3xl mb-4 font-semibold text-gray-400">You</h2>
                <div className="flex gap-4 justify-center">
                  <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
                  <div className="border-2 border-gray-600 rounded-lg w-20 h-28 bg-green-900 bg-opacity-40"></div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 mt-4">
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    value={betInput} 
                    onChange={(e) => setBetInput(e.target.value)}
                    placeholder="Enter bet amount"
                    min="1"
                    max={chips}
                    className="border-2 border-yellow-600 p-3 rounded-lg text-black w-48 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white"
                  />
                  <button 
                    onClick={placeBet}
                    disabled={!betInput || Number(betInput) <= 0 || Number(betInput) > chips}
                    className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Place Bet
                  </button>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setBetInput('5')}
                    disabled={chips < 5}
                    className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
                  >
                    $5
                  </button>
                  <button 
                    onClick={() => setBetInput('25')}
                    disabled={chips < 25}
                    className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
                  >
                    $25
                  </button>
                  <button 
                    onClick={() => setBetInput('100')}
                    disabled={chips < 100}
                    className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
                  >
                    $100
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
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

              {gameState === 'player-turn' && (
                <div className="flex flex-col items-center gap-4">
                  {aiAdvice && !loadingAI && (
                    <div className="bg-blue-900 border-2 border-blue-400 rounded-lg p-3 max-w-md">
                      <div className="text-center">
                        <div className="text-base font-bold text-blue-300 mb-1">
                          AI Suggests: {aiAdvice.action}
                        </div>
                        <div className="text-white text-xs">
                          {aiAdvice.reason}
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingAI && (
                    <div className="bg-blue-900 border-2 border-blue-400 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-3 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white font-semibold">Getting AI advice...</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-6 mt-2">
                    <button 
                      onClick={handleHit}
                      className={`bg-red-600 text-white cursor-pointer font-bold px-8 py-2 rounded-lg hover:bg-red-500 transition-all text-lg ${
                        highlightButton === 'hit' 
                          ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-green-900 scale-110 shadow-2xl' 
                          : ''
                      }`}
                    >
                      Hit
                    </button>
                    <button 
                      onClick={handleStand}
                      className={`bg-yellow-600 cursor-pointer text-white font-bold px-8 py-2 rounded-lg hover:bg-yellow-500 transition-all text-lg ${
                        highlightButton === 'stand' 
                          ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-green-900 scale-110 shadow-2xl' 
                          : ''
                      }`}
                    >
                      Stand
                    </button>
                  </div>

                  <button
                    onClick={getAIAdvice}
                    disabled={loadingAI}
                    className="bg-blue-600 cursor-pointer text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"/>
                    </svg>
                    {loadingAI ? 'Thinking...' : 'Ask AI for Advice'}
                  </button>
                </div>
              )}
            </>
          )}

          {gameState !== 'waiting' && (
            <div className="mt-auto mb-8 text-center">
              <div className="text-2xl font-semibold">
                Current Bet: <span className="text-yellow-400">${currentBet}</span>
              </div>
            </div>
          )}

          {gameState === 'game-over' && (
            <div className="fixed bottom-24 left-0 right-0 text-center">
              <button
                onClick={newGame}
                className="bg-green-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-green-500 transition-colors text-xl cursor-pointer"
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
                onClick={() => {
                  const newChips = 500;
                  setChips(newChips);
                  if (user) updateUserChipsInDatabase(newChips);
                }}
                className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-blue-500 transition-colors text-xl cursor-pointer"
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



// 'use client';

// import { motion } from 'framer-motion';
// import { useState, useEffect, useCallback } from 'react';
// import { createSupabaseClient } from '@/lib/supabase/client';
// import { useAuth } from '../../contexts/AuthContext';
// import AuthForm from './AuthForm';

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
//     } else if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
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

// function CardComponent({ card, animate, slideFrom, isMobile }: { card: Card; animate: boolean; slideFrom: 'top' | 'bottom'; isMobile: boolean }) {
//   const suitSymbols: Record<string, string> = {
//     'Hearts': '♥',
//     'Diamonds': '♦',
//     'Clubs': '♣',
//     'Spades': '♠'
//   };
  
//   const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
  
//   if (animate) {
//     const initialY = slideFrom === 'top' ? -100 : 100;
    
//     return (
//       <motion.div
//         initial={{ y: initialY, opacity: 0, scale: 0.8 }}
//         animate={{ y: 0, opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5, ease: "easeOut" }}
//         className={`border-2 border-gray-300 rounded-lg ${
//           isMobile ? 'w-14 h-20' : 'w-20 h-28'
//         } bg-white flex flex-col items-center justify-center shadow-lg`}
//       >
//         <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
//           {card.value}
//         </div>
//         <div className={`${isMobile ? 'text-xl' : 'text-3xl'} ${isRed ? 'text-red-600' : 'text-black'}`}>
//           {suitSymbols[card.suit]}
//         </div>
//       </motion.div>
//     );
//   }
  
//   return (
//     <div className={`border-2 border-gray-300 rounded-lg ${
//       isMobile ? 'w-14 h-20' : 'w-20 h-28'
//     } bg-white flex flex-col items-center justify-center shadow-lg`}>
//       <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
//         {card.value}
//       </div>
//       <div className={`${isMobile ? 'text-xl' : 'text-3xl'} ${isRed ? 'text-red-600' : 'text-black'}`}>
//         {suitSymbols[card.suit]}
//       </div>
//     </div>
//   );
// }

// function CoinIcon() {
//   return (
//     <svg className="w-6 h-6 inline-block mr-2" fill="gold" viewBox="0 0 24 24">
//       <circle cx="12" cy="12" r="10" stroke="goldenrod" strokeWidth="2" fill="gold"/>
//       <text x="12" y="16" textAnchor="middle" fontSize="12" fill="darkgoldenrod" fontWeight="bold">$</text>
//     </svg>
//   );
// }

// export default function BlackjackGame() {
//   const { user, isGuest, signOut } = useAuth();
//   const [playerHand, setPlayerHand] = useState<Card[]>([]);
//   const [dealerHand, setDealerHand] = useState<Card[]>([]);
//   const [deck, setDeck] = useState<Card[]>([]);
//   const [gameState, setGameState] = useState<'waiting' | 'player-turn' | 'dealer-turn' | 'game-over'>('waiting');
//   const [gameResult, setGameResult] = useState<'win' | 'lose' | 'tie' | 'blackjack' | ''>('');
//   const [chips, setChips] = useState(500);
//   const [currentBet, setCurrentBet] = useState(0);
//   const [betInput, setBetInput] = useState<string>('');
//   const [currentMenu, setCurrentMenu] = useState<'game' | 'chips' | 'history'>('game');
//   const [cardCount, setCardCount] = useState(0);
//   const [history, setHistory] = useState<GameHistory[]>([]);
//   const [displayPlayerValue, setDisplayPlayerValue] = useState(0);
//   const [displayDealerValue, setDisplayDealerValue] = useState(0);
//   const [showAuthForm, setShowAuthForm] = useState(false);
//   const [showSavePrompt, setShowSavePrompt] = useState(false);
//   const [aiAdvice, setAiAdvice] = useState<{ action: string; reason: string } | null>(null);
//   const [loadingAI, setLoadingAI] = useState(false);
//   const [highlightButton, setHighlightButton] = useState<'hit' | 'stand' | null>(null);
//   const [isMobile, setIsMobile] = useState(false);

//   // Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
    
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Load user chips from database
//   useEffect(() => {
//     const loadUserData = async () => {
//       if (!user) return;

//       const supabase = createSupabaseClient();
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('chips, username')
//         .eq('id', user.id)
//         .single();

//       if (error) {
//         console.error('Error loading user data:', error);
//       } else if (data) {
//         setChips(data.chips || 500);
//       }
//     };

//     loadUserData();
//   }, [user]);

//   // Load game history from database
//   useEffect(() => {
//     const loadHistory = async () => {
//       if (!user) return;

//       const supabase = createSupabaseClient();
//       const { data, error } = await supabase
//         .from('game_sessions')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('created_at', { ascending: false })
//         .limit(50);

//       if (error) {
//         console.error('Error loading history:', error);
//       } else if (data) {
//         const formattedHistory = data.map(game => ({
//           date: new Date(game.created_at).toLocaleString(),
//           bet: game.bet_amount,
//           playerScore: game.player_score,
//           dealerScore: game.dealer_score,
//           result: game.result as 'win' | 'lose' | 'tie' | 'blackjack'
//         }));
//         setHistory(formattedHistory);
//       }
//     };

//     loadHistory();
//   }, [user]);

//   const logGameToDatabase = async (result: string, netChips: number) => {
//     if (!user) return;

//     try {
//       const supabase = createSupabaseClient();
      
//       const { error } = await supabase
//         .from('game_sessions')
//         .insert([
//           {
//             user_id: user.id,
//             bet_amount: currentBet,
//             player_score: displayPlayerValue,
//             dealer_score: displayDealerValue,
//             result: result,
//             net_chips: netChips,
//             created_at: new Date().toISOString()
//           }
//         ]);

//       if (error) {
//         console.error('Failed to log game:', error);
//       }
//     } catch (err) {
//       console.error('Database error:', err);
//     }
//   };

//   const updateUserChipsInDatabase = async (newChips: number) => {
//     if (!user) return;

//     try {
//       const supabase = createSupabaseClient();
      
//       const { error } = await supabase
//         .from('profiles')
//         .update({ 
//           chips: newChips,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', user.id);

//       if (error) {
//         console.error('Failed to update chips:', error);
//       }
//     } catch (err) {
//       console.error('Database error:', err);
//     }
//   };

//   const calculateNetChips = useCallback((result: string): number => {
//     switch (result) {
//       case 'blackjack':
//         return Math.floor(currentBet * 1.5);
//       case 'win':
//         return currentBet;
//       case 'tie':
//         return 0;
//       case 'lose':
//         return -currentBet;
//       default:
//         return 0;
//     }
//   }, [currentBet]);

//   const determineWinner = useCallback(() => {
//     const playerValue = calculateHandValue(playerHand);
//     const dealerValue = calculateHandValue(dealerHand);
    
//     let result: 'win' | 'lose' | 'tie' | 'blackjack' = 'lose';
//     let netChips = 0;
    
//     if (dealerValue > 21) {
//       result = 'win';
//       netChips = currentBet;
//       setChips(c => c + currentBet * 2);
//     } else if (playerValue > dealerValue) {
//       result = 'win';
//       netChips = currentBet;
//       setChips(c => c + currentBet * 2);
//     } else if (dealerValue > playerValue) {
//       result = 'lose';
//       netChips = -currentBet;
//     } else {
//       result = 'tie';
//       netChips = 0;
//       setChips(c => c + currentBet);
//     }

//     const gameRecord: GameHistory = {
//       date: new Date().toLocaleString(),
//       bet: currentBet,
//       playerScore: playerValue,
//       dealerScore: dealerValue,
//       result: result
//     };
//     setHistory(prev => [gameRecord, ...prev]);

//     logGameToDatabase(result, netChips);
    
//     const finalChips = result === 'tie' 
//       ? chips + currentBet 
//       : result === 'lose' 
//       ? chips 
//       : chips + currentBet * 2;
    
//     updateUserChipsInDatabase(finalChips);
    
//     setGameResult(result);
//     setGameState('game-over');

//     if (isGuest && (result === 'win' || result === 'blackjack')) {
//       setShowSavePrompt(true);
//     }
//   }, [playerHand, dealerHand, currentBet, chips, isGuest, calculateNetChips]);

//   useEffect(() => {
//     if (gameState === 'waiting') {
//       setPlayerHand([]);
//       setDealerHand([]);
//       setDeck([]);
//       setGameResult('');
//       setCardCount(0);
//       setDisplayPlayerValue(0);
//       setDisplayDealerValue(0);
//       setAiAdvice(null);
//       setHighlightButton(null);
//     }
//   }, [gameState]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDisplayPlayerValue(calculateHandValue(playerHand));
//     }, 200);
//     return () => clearTimeout(timer);
//   }, [playerHand]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDisplayDealerValue(calculateHandValue(dealerHand));
//     }, 200);
//     return () => clearTimeout(timer);
//   }, [dealerHand]);

//   useEffect(() => {
//     if (gameState === 'player-turn' && playerHand.length === 2) {
//       const playerValue = calculateHandValue(playerHand);
//       const dealerValue = calculateHandValue(dealerHand);
      
//       if (playerValue === 21) {
//         let result: 'tie' | 'blackjack' = 'blackjack';
//         let netChips = 0;
        
//         if (dealerValue === 21) {
//           result = 'tie';
//           netChips = 0;
//           setChips(c => c + currentBet);
//         } else {
//           result = 'blackjack';
//           netChips = Math.floor(currentBet * 1.5);
//           setChips(c => c + currentBet + netChips);
//         }
        
//         const gameRecord: GameHistory = {
//           date: new Date().toLocaleString(),
//           bet: currentBet,
//           playerScore: playerValue,
//           dealerScore: dealerValue,
//           result: result
//         };
//         setHistory(prev => [gameRecord, ...prev]);

//         logGameToDatabase(result, netChips);
        
//         const finalChips = result === 'tie' 
//           ? chips + currentBet 
//           : chips + currentBet + netChips;
        
//         updateUserChipsInDatabase(finalChips);
        
//         setGameResult(result);
//         setGameState('game-over');

//         if (isGuest && (result === 'blackjack' || result === 'win')) {
//           setShowSavePrompt(true);
//         }
//       }
//     }
//   }, [gameState, playerHand, dealerHand, currentBet, chips, isGuest]);

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
//   }, [gameState, dealerHand, deck, determineWinner]);

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
//       const gameRecord: GameHistory = {
//         date: new Date().toLocaleString(),
//         bet: currentBet,
//         playerScore: newHandValue,
//         dealerScore: calculateHandValue(dealerHand),
//         result: 'lose'
//       };
//       setHistory(prev => [gameRecord, ...prev]);

//       const netChips = -currentBet;
//       logGameToDatabase('lose', netChips);
//       updateUserChipsInDatabase(chips);
      
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

//   const newGame = () => {
//     setGameState('waiting');
//     setCurrentBet(0);
//     setShowSavePrompt(false);
//     setAiAdvice(null);
//     setHighlightButton(null);
//   };

//   const getAIAdvice = async () => {
//     if (gameState !== 'player-turn' || loadingAI) return;

//     setLoadingAI(true);
//     setAiAdvice(null);
//     setHighlightButton(null);

//     try {
//       console.log('Sending AI advice request to /api/blackjack-advice...');
      
//       const response = await fetch('/api/blackjack-advice', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           playerHand: playerHand,
//           dealerUpcard: dealerHand[0],
//           playerValue: calculateHandValue(playerHand)
//         })
//       });

//       console.log('📥 Response status:', response.status);
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('API Error:', errorText);
//         throw new Error(`API error: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('AI Advice received:', data);
      
//       setAiAdvice(data);
//       setHighlightButton(data.action === 'HIT' ? 'hit' : 'stand');

//       setTimeout(() => {
//         setHighlightButton(null);
//       }, 5000);

//     } catch (error) {
//       console.error('Error getting AI advice:', error);
//       setAiAdvice({ 
//         action: 'ERROR', 
//         reason: 'Failed to get advice. Check console for details.' 
//       });
//     } finally {
//       setLoadingAI(false);
//     }
//   };

//   return (
//     <div className={`min-h-screen bg-gradient-to-br from-green-800 to-green-900 text-white ${
//       isMobile ? 'p-4' : 'p-8'
//     }`}>
//       {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} onSuccess={() => setShowSavePrompt(false)} />}
      
//       <div className={`fixed ${isMobile ? 'top-4 right-4' : 'top-8 right-8'} flex items-center gap-4`}>
//         <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-semibold`}>
//           <CoinIcon /> {chips}
//         </h2>
//         {isGuest ? (
//           <button
//             onClick={() => setShowAuthForm(true)}
//             className={`bg-yellow-500 text-black font-semibold ${
//               isMobile ? 'px-3 py-1 text-sm' : 'px-4 py-2'
//             } rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer`}
//           >
//             {isMobile ? 'Sign In' : 'Sign In'}
//           </button>
//         ) : (
//           <button
//             onClick={signOut}
//             className={`bg-red-600 text-white font-semibold ${
//               isMobile ? 'px-3 py-1 text-sm' : 'px-4 py-2'
//             } rounded-lg hover:bg-red-500 transition-colors cursor-pointer`}
//           >
//             {isMobile ? 'Sign Out' : 'Sign Out'}
//           </button>
//         )}
//       </div>

//       {showSavePrompt && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
//           <div className={`bg-gradient-to-br from-green-800 to-green-900 rounded-xl shadow-2xl ${
//             isMobile ? 'p-6 mx-4' : 'p-8'
//           } max-w-md border-4 border-yellow-500`}>
//             <h3 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-yellow-400 mb-4 text-center`}>Great Win!</h3>
//             <p className="text-white text-lg mb-6 text-center">
//               Sign in to save your progress and chips!
//             </p>
//             <div className="flex gap-4">
//               <button
//                 onClick={() => setShowAuthForm(true)}
//                 className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer"
//               >
//                 Sign In
//               </button>
//               <button
//                 onClick={() => setShowSavePrompt(false)}
//                 className="flex-1 bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-500 transition-colors cursor-pointer"
//               >
//                 Later
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center mb-4 text-yellow-400`}>♠ BLACKJACK ♥</h1>
      
//       {currentMenu === 'game' && (
//         <div className={`flex justify-center ${isMobile ? 'gap-2 mb-4' : 'gap-4 mb-6'}`}>
//           <button 
//             onClick={() => setCurrentMenu('chips')} 
//             className={`bg-purple-600 text-white font-semibold ${
//               isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'
//             } rounded-lg hover:bg-purple-500 transition-colors cursor-pointer`}
//           >
//             Buy Chips
//           </button>
//           <button 
//             onClick={() => setCurrentMenu('history')} 
//             className={`bg-indigo-600 text-white font-semibold ${
//               isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'
//             } rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer`}
//           >
//             Game History
//           </button>
//         </div>
//       )}

//       {currentMenu === 'chips' && (
//         <div className="flex flex-col items-center">
//           <button 
//             onClick={() => setCurrentMenu('game')}
//             className="mb-8 text-white hover:text-red-400 text-5xl font-bold cursor-pointer"
//           >
//             ×
//           </button>
//           <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-8 text-yellow-400`}>Buy Chips</h2>
//           <div className={`grid grid-cols-2 ${isMobile ? 'gap-3' : 'gap-6'}`}>
//             <button 
//               onClick={() => {
//                 const newChips = chips + 100;
//                 setChips(newChips);
//                 if (user) updateUserChipsInDatabase(newChips);
//               }} 
//               className={`bg-blue-600 text-white font-bold ${
//                 isMobile ? 'px-6 py-6 text-lg' : 'px-12 py-8 text-2xl'
//               } rounded-lg hover:bg-blue-500 transition-colors cursor-pointer`}
//             >
//               +100 Chips
//             </button>
//             <button 
//               onClick={() => {
//                 const newChips = chips + 500;
//                 setChips(newChips);
//                 if (user) updateUserChipsInDatabase(newChips);
//               }} 
//               className={`bg-blue-600 text-white font-bold ${
//                 isMobile ? 'px-6 py-6 text-lg' : 'px-12 py-8 text-2xl'
//               } rounded-lg hover:bg-blue-500 transition-colors cursor-pointer`}
//             >
//               +500 Chips
//             </button>
//             <button 
//               onClick={() => {
//                 const newChips = chips + 1000;
//                 setChips(newChips);
//                 if (user) updateUserChipsInDatabase(newChips);
//               }} 
//               className={`bg-blue-600 text-white font-bold ${
//                 isMobile ? 'px-6 py-6 text-lg' : 'px-12 py-8 text-2xl'
//               } rounded-lg hover:bg-blue-500 transition-colors cursor-pointer`}
//             >
//               +1000 Chips
//             </button>
//             <button 
//               onClick={() => {
//                 const newChips = chips + 5000;
//                 setChips(newChips);
//                 if (user) updateUserChipsInDatabase(newChips);
//               }} 
//               className={`bg-blue-600 text-white font-bold ${
//                 isMobile ? 'px-6 py-6 text-lg' : 'px-12 py-8 text-2xl'
//               } rounded-lg hover:bg-blue-500 transition-colors cursor-pointer`}
//             >
//               +5000 Chips
//             </button>
//           </div>
//         </div>
//       )}

//       {currentMenu === 'history' && (
//         <div className="flex flex-col items-center">
//           <button 
//             onClick={() => setCurrentMenu('game')}
//             className="mb-8 text-white hover:text-red-400 text-5xl font-bold cursor-pointer"
//           >
//             ×
//           </button>
//           <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-8 text-yellow-400`}>Game History</h2>
//           {isGuest ? (
//             <div className={`${isMobile ? 'w-full' : 'max-w-4xl w-full'} bg-gray-800 rounded-lg ${
//               isMobile ? 'p-4' : 'p-8'
//             } text-center`}>
//               <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-300 mb-4`}>Sign in to view your game history</p>
//               <button
//                 onClick={() => setShowAuthForm(true)}
//                 className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer"
//               >
//                 Sign In
//               </button>
//             </div>
//           ) : (
//             <div className={`${isMobile ? 'w-full' : 'max-w-4xl w-full'} bg-gray-800 rounded-lg ${
//               isMobile ? 'p-3' : 'p-6'
//             } max-h-[60vh] overflow-y-auto`}>
//               {history.length === 0 ? (
//                 <p className="text-center text-gray-400 text-xl">No games played yet</p>
//               ) : (
//                 <div className="space-y-3">
//                   {history.map((game, index) => (
//                     <div key={index} className={`bg-gray-700 rounded ${
//                       isMobile ? 'p-3 flex-col gap-2' : 'p-4 flex justify-between items-center'
//                     }`}>
//                       <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-300`}>{game.date}</div>
//                       <div className={`flex ${isMobile ? 'flex-col gap-1' : 'gap-8 items-center'}`}>
//                         <div className={`${isMobile ? 'text-sm' : 'text-base'}`}>
//                           <span className="text-gray-400">Bet:</span> <span className="text-yellow-400 font-semibold">${game.bet}</span>
//                         </div>
//                         <div className={`${isMobile ? 'text-sm' : 'text-base'}`}>
//                           <span className="text-gray-400">Score:</span> <span className="font-semibold">{game.playerScore}</span> vs <span className="font-semibold">{game.dealerScore}</span>
//                         </div>
//                         <div className={`font-bold ${isMobile ? 'text-xs px-2 py-1' : 'text-base px-4 py-2'} rounded ${
//                           game.result === 'win' || game.result === 'blackjack' 
//                             ? 'bg-green-600 text-white' 
//                             : game.result === 'lose' 
//                             ? 'bg-red-600 text-white' 
//                             : 'bg-yellow-600 text-white'
//                         }`}>
//                           {game.result === 'blackjack' ? 'BLACKJACK!' : game.result.toUpperCase()}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
      
//       {currentMenu === 'game' && (
//         <div className={`mt-8 flex flex-col items-center ${isMobile ? 'gap-4' : 'gap-8'}`}>
//           {gameState === 'waiting' ? (
//             <>
//               <div className="text-center">
//                 <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} mb-4 font-semibold text-gray-400`}>Dealer</h2>
//                 <div className="flex gap-4 justify-center">
//                   <div className={`border-2 border-gray-600 rounded-lg ${
//                     isMobile ? 'w-14 h-20' : 'w-20 h-28'
//                   } bg-green-900 bg-opacity-40`}></div>
//                   <div className={`border-2 border-gray-600 rounded-lg ${
//                     isMobile ? 'w-14 h-20' : 'w-20 h-28'
//                   } bg-green-900 bg-opacity-40`}></div>
//                 </div>
//               </div>

//               <div className="text-center">
//                 <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} mb-4 font-semibold text-gray-400`}>You</h2>
//                 <div className="flex gap-4 justify-center">
//                   <div className={`border-2 border-gray-600 rounded-lg ${
//                     isMobile ? 'w-14 h-20' : 'w-20 h-28'
//                   } bg-green-900 bg-opacity-40`}></div>
//                   <div className={`border-2 border-gray-600 rounded-lg ${
//                     isMobile ? 'w-14 h-20' : 'w-20 h-28'
//                   } bg-green-900 bg-opacity-40`}></div>
//                 </div>
//               </div>

//               <div className="flex flex-col items-center gap-4 mt-4">
//                 <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center gap-4'}`}>
//                   <input 
//                     type="number" 
//                     value={betInput} 
//                     onChange={(e) => setBetInput(e.target.value)}
//                     placeholder="Enter bet amount"
//                     min="1"
//                     max={chips}
//                     className={`border-2 border-yellow-600 p-3 rounded-lg text-black ${
//                       isMobile ? 'w-full' : 'w-48'
//                     } text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white`}
//                   />
//                   <button 
//                     onClick={placeBet}
//                     disabled={!betInput || Number(betInput) <= 0 || Number(betInput) > chips}
//                     className={`bg-yellow-500 text-black font-bold ${
//                       isMobile ? 'w-full px-4 py-3' : 'px-8 py-3'
//                     } rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer`}
//                   >
//                     Place Bet
//                   </button>
//                 </div>
//                 <div className="flex gap-3">
//                   <button 
//                     onClick={() => setBetInput('5')}
//                     disabled={chips < 5}
//                     className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
//                   >
//                     $5
//                   </button>
//                   <button 
//                     onClick={() => setBetInput('25')}
//                     disabled={chips < 25}
//                     className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
//                   >
//                     $25
//                   </button>
//                   <button 
//                     onClick={() => setBetInput('100')}
//                     disabled={chips < 100}
//                     className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
//                   >
//                     $100
//                   </button>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="text-center">
//                 <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} mb-4 font-semibold`}>
//                   Dealer: <span className="text-yellow-400">
//                     {gameState === 'player-turn' ? '?' : displayDealerValue}
//                   </span>
//                 </h2>
//                 <div className="flex gap-4 justify-center">
//                   {dealerHand.map((card, index) => (
//                     <div key={`dealer-${index}`}>
//                       {index === 1 && gameState === 'player-turn' ? (
//                         <motion.div 
//                           initial={{ y: -100, opacity: 0, scale: 0.8 }}
//                           animate={{ y: 0, opacity: 1, scale: 1 }}
//                           transition={{ duration: 0.5, ease: "easeOut" }}
//                           className={`border-2 border-gray-300 rounded-lg ${
//                             isMobile ? 'w-14 h-20' : 'w-20 h-28'
//                           } bg-blue-600 flex items-center justify-center shadow-lg`}
//                         >
//                           <div className="text-4xl">🂠</div>
//                         </motion.div>
//                       ) : (
//                         <CardComponent 
//                           card={card} 
//                           animate={index >= 2 && index === dealerHand.length - 1} 
//                           slideFrom="top" 
//                           isMobile={isMobile}
//                         />
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="text-center">
//                 <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} mb-4 font-semibold flex items-center justify-center gap-3`}>
//                   <span>You: <span className="text-yellow-400">{displayPlayerValue}</span></span>
//                   {gameState === 'game-over' && (
//                     <span className={`font-bold ${
//                       isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'
//                     } rounded ${
//                       gameResult === 'win' || gameResult === 'blackjack' 
//                         ? 'bg-green-600 text-white' 
//                         : gameResult === 'lose' 
//                         ? 'bg-red-600 text-white' 
//                         : 'bg-yellow-600 text-white'
//                     }`}>
//                       {gameResult === 'blackjack' ? 'BLACKJACK!' : gameResult === 'win' ? 'WIN' : gameResult === 'lose' ? 'LOSE' : 'PUSH'}
//                     </span>
//                   )}
//                 </h2>
//                 <div className="flex gap-4 justify-center">
//                   {playerHand.map((card, index) => {
//                     const isNewCard = (index >= 2) && (index === playerHand.length - 1);
//                     return (
//                       <CardComponent 
//                         key={`player-${index}`} 
//                         card={card} 
//                         animate={isNewCard} 
//                         slideFrom="bottom" 
//                         isMobile={isMobile}
//                       />
//                     );
//                   })}
//                 </div>
//               </div>

//               {gameState === 'player-turn' && (
//                 <div className="flex flex-col items-center gap-4">
//                   {aiAdvice && !loadingAI && (
//                     <div className="bg-blue-900 border-2 border-blue-400 rounded-lg p-4 max-w-md">
//                       <div className="text-center">
//                         <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-300 mb-2`}>
//                           AI Suggests: {aiAdvice.action}
//                         </div>
//                         <div className="text-white text-sm">
//                           {aiAdvice.reason}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {loadingAI && (
//                     <div className="bg-blue-900 border-2 border-blue-400 rounded-lg p-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-6 h-6 border-3 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
//                         <span className="text-white font-semibold">Getting AI advice...</span>
//                       </div>
//                     </div>
//                   )}

//                   <div className={`flex ${isMobile ? 'flex-col gap-3 w-full max-w-xs' : 'gap-6 mt-2'}`}>
//                     <button 
//                       onClick={handleHit}
//                       className={`bg-red-600 text-white cursor-pointer font-bold ${
//                         isMobile ? 'px-6 py-4 text-lg w-full' : 'px-8 py-4 text-xl'
//                       } rounded-lg hover:bg-red-500 transition-all ${
//                         highlightButton === 'hit' 
//                           ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-green-900 scale-110 shadow-2xl' 
//                           : ''
//                       }`}
//                     >
//                       {isMobile ? '👆 Hit' : 'Hit'}
//                     </button>
//                     <button 
//                       onClick={handleStand}
//                       className={`bg-yellow-600 cursor-pointer text-white font-bold ${
//                         isMobile ? 'px-6 py-4 text-lg w-full' : 'px-8 py-4 text-xl'
//                       } rounded-lg hover:bg-yellow-500 transition-all ${
//                         highlightButton === 'stand' 
//                           ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-green-900 scale-110 shadow-2xl' 
//                           : ''
//                       }`}
//                     >
//                       {isMobile ? '✋ Stand' : 'Stand'}
//                     </button>
//                   </div>

//                   <button
//                     onClick={getAIAdvice}
//                     disabled={loadingAI}
//                     className={`bg-blue-600 cursor-pointer text-white font-semibold ${
//                       isMobile ? 'px-4 py-2 text-sm w-full max-w-xs' : 'px-6 py-3'
//                     } rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
//                   >
//                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                       <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"/>
//                     </svg>
//                     {loadingAI ? 'Thinking...' : 'Ask AI for Advice'}
//                   </button>
//                 </div>
//               )}
//             </>
//           )}

//           {gameState !== 'waiting' && (
//             <div className="fixed bottom-8 left-0 right-0 text-center">
//               <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold`}>
//                 Current Bet: <span className="text-yellow-400">${currentBet}</span>
//               </div>
//             </div>
//           )}

//           {gameState === 'game-over' && (
//             <div className="fixed bottom-24 left-0 right-0 text-center">
//               <button
//                 onClick={newGame}
//                 className={`bg-green-600 text-white font-bold ${
//                   isMobile ? 'px-6 py-3 text-lg' : 'px-8 py-4 text-xl'
//                 } rounded-lg hover:bg-green-500 transition-colors cursor-pointer`}
//               >
//                 New Game
//               </button>
//             </div>
//           )}
          
//           {chips === 0 && gameState === 'waiting' && (
//             <div className="text-center mt-8">
//               <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-red-400 mb-4`}>
//                 Out of Chips!
//               </div>
//               <button
//                 onClick={() => {
//                   const newChips = 500;
//                   setChips(newChips);
//                   if (user) updateUserChipsInDatabase(newChips);
//                 }}
//                 className={`bg-blue-600 text-white font-bold ${
//                   isMobile ? 'px-6 py-3 text-lg' : 'px-8 py-4 text-xl'
//                 } rounded-lg hover:bg-blue-500 transition-colors cursor-pointer`}
//               >
//                 Reset Chips
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
