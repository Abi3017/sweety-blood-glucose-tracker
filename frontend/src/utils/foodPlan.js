/**
 * General healthy-eating ideas (fibre, protein, vegetables, whole grains). They are suggestions
 * only: not a personal diet plan and not medical advice.
 */

export const MEAL_TABS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙' },
  { key: 'snack', label: 'Snacks', emoji: '🍎' },
  { key: 'night', label: 'Late night', emoji: '🌃' },
];

export const MEALS = {
  breakfast: [
    { id: 'b1', emoji: '🥣', name: 'Oats with nuts & berries', description: 'Rolled oats cooked in water or milk, topped with a small handful of nuts and fresh berries.', tags: ['High fibre', 'Whole grain'] },
    { id: 'b2', emoji: '🍳', name: 'Veg omelette & whole-grain toast', description: 'Eggs with spinach, tomato and onion, served with one slice of whole-grain toast.', tags: ['Protein', 'Veggies'] },
    { id: 'b3', emoji: '🫓', name: 'Besan chilla with mint chutney', description: 'Gram-flour pancakes with grated vegetables, cooked with very little oil.', tags: ['Protein', 'High fibre'] },
    { id: 'b4', emoji: '🥛', name: 'Plain yoghurt with seeds', description: 'Unsweetened yoghurt with chia or flax seeds and a few pieces of chopped fruit.', tags: ['Protein', 'Low added sugar'] },
  ],
  lunch: [
    { id: 'l1', emoji: '🍛', name: 'Dal, vegetables & one small roti', description: 'A bowl of dal with a generous serving of mixed vegetables and a single whole-wheat roti.', tags: ['Plant protein', 'High fibre'] },
    { id: 'l2', emoji: '🥗', name: 'Grilled chicken or paneer salad', description: 'Leafy greens, cucumber and tomato with grilled chicken or paneer and a lemon dressing.', tags: ['Protein', 'Veggies'] },
    { id: 'l3', emoji: '🐟', name: 'Baked fish, greens & brown rice', description: 'A palm-sized piece of baked fish with steamed vegetables and a small portion of brown rice.', tags: ['Protein', 'Whole grain'] },
    { id: 'l4', emoji: '🥙', name: 'Chickpea & vegetable bowl', description: 'Boiled chickpeas with chopped vegetables, herbs, lemon and a spoon of curd.', tags: ['High fibre', 'Plant protein'] },
  ],
  dinner: [
    { id: 'd1', emoji: '🍲', name: 'Vegetable & lentil soup', description: 'A warm lentil soup full of vegetables, with a side salad.', tags: ['High fibre', 'Light'] },
    { id: 'd2', emoji: '🍗', name: 'Grilled chicken or tofu with greens', description: 'Grilled chicken or tofu with lightly sautéed greens and a few slices of tomato.', tags: ['Protein', 'Veggies'] },
    { id: 'd3', emoji: '🥬', name: 'Palak paneer & millet roti', description: 'Spinach and paneer curry made with minimal oil, with one small millet roti.', tags: ['Protein', 'Whole grain'] },
    { id: 'd4', emoji: '🍚', name: 'Vegetable khichdi with curd', description: 'Moong dal and rice cooked with vegetables, served with a bowl of plain curd.', tags: ['Comfort', 'Plant protein'] },
  ],
  snack: [
    { id: 's1', emoji: '🥜', name: 'A small handful of nuts', description: 'Unsalted almonds, walnuts or peanuts, about a palmful.', tags: ['Protein', 'Healthy fats'] },
    { id: 's2', emoji: '🥕', name: 'Veg sticks with hummus', description: 'Cucumber and carrot sticks with a couple of spoons of hummus.', tags: ['High fibre', 'Crunchy'] },
    { id: 's3', emoji: '🍎', name: 'Apple slices with peanut butter', description: 'Half an apple with a teaspoon of unsweetened peanut butter.', tags: ['Fibre', 'Protein'] },
    { id: 's4', emoji: '🥚', name: 'Boiled egg or roasted chana', description: 'One boiled egg, or a small bowl of roasted chickpeas.', tags: ['Protein', 'Filling'] },
  ],
  night: [
    { id: 'n1', emoji: '🥛', name: 'A glass of warm milk', description: 'Plain, unsweetened milk, warm, if you need something before bed.', tags: ['Light', 'Unsweetened'] },
    { id: 'n2', emoji: '🥣', name: 'A small bowl of plain curd', description: 'A few spoons of plain curd, with no sugar added.', tags: ['Protein', 'Light'] },
    { id: 'n3', emoji: '🌰', name: 'A few soaked almonds', description: 'Four or five almonds are plenty.', tags: ['Healthy fats', 'Small portion'] },
    { id: 'n4', emoji: '🍵', name: 'Herbal tea, no sugar', description: 'A cup of caffeine-free herbal tea such as chamomile.', tags: ['Caffeine-free', 'Zero sugar'] },
  ],
};

/** The plate method: a simple way to portion a meal. */
export const PLATE = [
  { label: 'Non-starchy vegetables', share: 'Half the plate', emoji: '🥦', color: '#34d399' },
  { label: 'Lean protein', share: 'A quarter', emoji: '🍗', color: '#f97316' },
  { label: 'Whole grains', share: 'A quarter', emoji: '🌾', color: '#fbbf24' },
];

export const HABITS = [
  { emoji: '💧', title: 'Drink water through the day', text: 'Choose water or unsweetened drinks instead of sugary ones.' },
  { emoji: '⏰', title: 'Keep meal times regular', text: 'Eating at similar times each day makes your readings easier to compare.' },
  { emoji: '🥄', title: 'Watch portion sizes', text: 'Use a smaller plate and serve starchy foods like rice and roti in small portions.' },
  { emoji: '🚶', title: 'Take a short walk after meals', text: 'Even 10 minutes of gentle movement is a good habit.' },
];

export const FOOD_DISCLAIMER =
  "These are general healthy-eating ideas, not a personal diet plan or medical advice. Please follow your doctor's or dietitian's guidance, especially if you take diabetes medication or insulin.";

/**
 * Which meal fits the clock. Evening starts at 5 PM, so at 5:41 PM the suggestion is dinner.
 * Returns the meal key, a short title and a one-line note about the time of day.
 */
export function mealForTime(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes >= 300 && minutes < 630) return { key: 'breakfast', title: 'Breakfast time', note: 'Start the day with something filling.' };
  if (minutes >= 630 && minutes < 720) return { key: 'snack', title: 'Mid-morning', note: "A light bite if you're hungry before lunch." };
  if (minutes >= 720 && minutes < 960) return { key: 'lunch', title: 'Lunch time', note: 'A balanced midday meal keeps the afternoon steady.' };
  if (minutes >= 960 && minutes < 1020) return { key: 'snack', title: 'Late afternoon', note: 'A small snack can tide you over until dinner.' };
  if (minutes >= 1020 && minutes < 1290) return { key: 'dinner', title: 'Dinner time', note: 'Evening is here. Try to finish dinner a couple of hours before bed, and keep it light.' };
  return { key: 'night', title: 'Late night', note: 'It is late. If you need anything, keep it small and light.' };
}
