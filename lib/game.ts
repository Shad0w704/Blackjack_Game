// export type Card = {
//   suit: 'Diamonds' | 'Spades' | 'Hearts' | 'Clubs';
//   value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
// }

// export function createDeck(): Card[] {
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

// export function shuffleDeck(deck: Card[]): Card[] {
//   const shuffled = [...deck];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

// export function calculateHandValue(hand: Card[]): number {
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

// export function initialDeal(deck: Card[]): {
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
