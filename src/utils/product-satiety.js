// Stable ingredient IDs from the USTA variant export.
const ingredients = {
  walnut: 'walnut',
  pistachio: 'pistachio',
  '59cb0273-2e66-4a0c-845d-dff8b3983a58': 'chocolate',
  banana: 'banana',
  'mixed-fruit': 'mixedFruit',
  'eb8b1811-7758-4212-90a3-0957fb6c5f6e': 'strawberry',
  raspberry: 'raspberry',
};

export function satietyRows(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    const ingredient = Object.hasOwn(ingredients, item?.ingredientId) ? ingredients[item.ingredientId] : null;
    return ingredient && Number.isInteger(item.level) && item.level >= 1 && item.level <= 5
      ? [{ ingredient, level: item.level }]
      : [];
  });
}
