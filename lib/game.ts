type Card = {
  suit: 'Diamonds' | 'Spades' | 'Hearts' | 'Clubs';
  value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}
const deck: Card[] = [];
export function createDeck(): Card[] {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'] as const;
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

  for (const suit of suits) {
    for (const value of values) {
      const newCard: Card = {
        suit: suit,
        value: value
      };
      deck.push(newCard);
    }
  }

  return deck;
}

console.log('Deck created:', createDeck());
console.log('Number of cards:', createDeck().length);


export function shuffleDeck(deck: Card[]): Card[] {
  const workingDeck = [...deck];
  const shuffled: Card[] = [];

  while (shuffled.length < 52) {
    const randomIndex = Math.floor(Math.random() * workingDeck.length);
    const tempCard = workingDeck.splice(randomIndex, 1)[0];
    shuffled.push(tempCard);
  }
  return shuffled;
}


export function calculateHandValue(hand: Card[]): number {
  let total = 0;

  for (const card of hand) {
    if (card.value == 'A') {
      total += 1   // I will treat aces as 1 for now.
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      total += 10;
    } else {
      total += Number(card.value);
    }
  }
  return total
}
export function dealHand(deck: Card[]): { hand: Card[]; remainingDeck: Card[] } {
  const hand_array: Card[] = []
    const new_deck = [...deck];

    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random()) * new_deck.length;
      hand_array[i] = new_deck.splice(randomIndex, 1)[0];
    }

    return { hand: hand_array, remainingDeck: new_deck }
}

export function initialDeal(deck: Card[]): {
  playerHand: Card[];
  dealerHand: Card[];
  remainingDeck: Card[];
} {
  let game_deck = createDeck()
  let temp_deck = game_deck

  temp_deck = shuffleDeck(temp_deck)
  // playerHand.push(temp_deck.splice())

    // First deal to player
  const { hand: playerHand, remainingDeck: deckAfterPlayer } = dealHand(deck);
  
  // Then deal to dealer from remaining deck
  const { hand: dealerHand, remainingDeck } = dealHand(deckAfterPlayer);

  return {
    playerHand,
    dealerHand, 
    remainingDeck
  }
}


export function playerTurn() {

}

export function dealerTurn() {

}

export function determineWinner() {

}

