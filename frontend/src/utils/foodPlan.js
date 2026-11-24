/**
 * General healthy-eating ideas (fibre, protein, vegetables, whole grains). They are suggestions
 * only: not a personal diet plan and not medical advice.
 */

export const MEAL_TABS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙' },
  { key: 'snack', label: 'Snacks', emoji: '🍎' },
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

const SLOT_TO_MEAL = { MORNING: 'breakfast', AFTER_BREAKFAST: 'breakfast', AFTER_LUNCH: 'lunch', AFTER_DINNER: 'dinner' };

/** Which meal to suggest next: the one for the first time slot without a reading today. */
export function suggestedMealKey(readings, slots) {
  const logged = new Set(readings.map((r) => r.timeSlot));
  const next = slots.find((s) => !logged.has(s));
  return next ? SLOT_TO_MEAL[next] : 'snack';
}
