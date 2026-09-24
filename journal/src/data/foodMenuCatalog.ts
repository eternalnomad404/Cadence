import type { FoodItem } from './foodMenu';

/** Always first in the diet menu — user types macros. */
export const CUSTOM_FOOD_ID = 'custom';

/**
 * Editable food menu — add more items over time.
 *
 * Peanut butter: 639 kcal / 30g protein per 100g; 1 spoon ≈ 16g
 *   → ~102 kcal · 4.8g protein per spoon
 *
 * HP bread: 245 kcal / 15.6g protein per 100g; 1 slice = 27g (2 slices = 54g)
 *   → ~66 kcal · 4.2g protein per slice
 *
 * Double toned milk: 47 kcal / 3.3g protein per 100ml; packet = 450ml
 *   → ~212 kcal · 14.9g protein per packet
 *
 * Cooked rice (weighed on plate): ~130 kcal / 2.7g protein per 100g cooked
 *   Default log qty 200g (typical single-plate serving; not 1kg)
 *
 * Taco Bell India Fiesta Taco - Potato: 199.8 kcal · 4.5g protein / taco
 *   → logged as 200 kcal · 4.5g protein per taco
 *
 * Plain Indian curd (dahi): ~62 kcal · 3.5g protein / 100g
 *   1 bowl ≈ 200g → ~124 kcal · 7g protein
 *
 * Kaju (raw cashew): ~553 kcal · 18.2g protein / 100g; 1 kernel ≈ 1.6g
 *   → ~9 kcal · 0.3g protein per piece
 *
 * Namkeen (avg mixture/bhujia): ~540 kcal · 14g protein / 100g
 *   Small snack bowl ≈ 30g (not a 200g curd bowl) → ~160 kcal · 4g protein
 */
export const FOOD_MENU: FoodItem[] = [
  {
    id: CUSTOM_FOOD_ID,
    name: 'Custom',
    brand: 'Type calories & protein yourself',
    image: '',
    unit: 'piece',
    unitLabel: 'entry',
    defaultQty: 1,
    step: 1,
    caloriesPerUnit: 0,
    proteinPerUnit: 0,
    detail: 'Anything not listed below',
    isCustom: true,
  },
  {
    id: 'amul-fresh-paneer',
    name: 'Regular Paneer',
    brand: 'Amul Fresh Paneer',
    image: '/foods/amul-fresh-paneer.png',
    unit: 'g',
    unitLabel: 'g',
    defaultQty: 100,
    step: 25,
    caloriesPerUnit: 2.96, // 296 / 100
    proteinPerUnit: 0.2, // 20 / 100
    detail: '296 kcal · 20g protein / 100g',
  },
  {
    id: 'milky-mist-hp-paneer',
    name: 'High Protein Paneer',
    brand: 'Milky Mist High Protein',
    image: '/foods/milky-mist-hp-paneer.png',
    unit: 'g',
    unitLabel: 'g',
    defaultQty: 100,
    step: 25,
    caloriesPerUnit: 2.0, // 200 / 100
    proteinPerUnit: 0.25, // 25 / 100
    detail: '200 kcal · 25g protein / 100g',
  },
  {
    id: 'peanut-butter',
    name: 'Peanut Butter',
    brand: 'Your PB (639 kcal · 30g P / 100g)',
    image: '/foods/peanut-butter.png',
    unit: 'spoon',
    unitLabel: 'spoon',
    defaultQty: 1,
    step: 1,
    // 1 spoon ≈ 16g → 639*0.16 ≈ 102 kcal, 30*0.16 = 4.8g protein
    caloriesPerUnit: 102,
    proteinPerUnit: 4.8,
    detail: '1 spoon ≈ 16g · ~102 kcal · 4.8g protein',
  },
  {
    id: 'roti-plain',
    name: 'Roti (no ghee)',
    brand: 'Medium atta roti',
    image: '/foods/roti-plain.png',
    unit: 'roti',
    unitLabel: 'roti',
    defaultQty: 1,
    step: 1,
    caloriesPerUnit: 80,
    proteinPerUnit: 3,
    detail: '1 roti · 80 kcal · 3g protein',
  },
  {
    id: 'roti-ghee',
    name: 'Roti (with ghee)',
    brand: 'Medium atta roti + ~1 tsp ghee',
    image: '/foods/roti-with-ghee.png',
    unit: 'roti',
    unitLabel: 'roti',
    defaultQty: 1,
    step: 1,
    // Plain ~120 + tsp ghee ~45
    caloriesPerUnit: 165,
    proteinPerUnit: 3.2,
    detail: 'Est. ~165 kcal · 3.2g protein each',
  },
  {
    id: 'paratha-plain',
    name: 'Paratha (plain)',
    brand: 'Home atta paratha · oil/ghee on tawa',
    image: '/foods/paratha-plain.png',
    unit: 'piece',
    unitLabel: 'paratha',
    defaultQty: 1,
    step: 1,
    // Typical Indian household medium plain paratha
    caloriesPerUnit: 170,
    proteinPerUnit: 4,
    detail: '1 paratha · ~170 kcal · 4g protein',
  },
  {
    id: 'aloo-paratha',
    name: 'Aloo Paratha',
    brand: 'Home stuffed potato paratha',
    image: '/foods/aloo-paratha.png',
    unit: 'piece',
    unitLabel: 'paratha',
    defaultQty: 1,
    step: 1,
    // Typical household aloo paratha with tawa oil/ghee
    caloriesPerUnit: 260,
    proteinPerUnit: 6,
    detail: '1 paratha · ~260 kcal · 6g protein',
  },
  {
    id: 'bread-normal',
    name: 'Normal Bread',
    brand: 'Regular sandwich bread',
    image: '/foods/bread-normal.png',
    unit: 'slice',
    unitLabel: 'slice',
    defaultQty: 1,
    step: 1,
    // Typical slice estimate
    caloriesPerUnit: 75,
    proteinPerUnit: 2.5,
    detail: 'Est. ~75 kcal · 2.5g protein / slice',
  },
  {
    id: 'bread-high-protein',
    name: 'High Protein Bread',
    brand: 'HP bread (245 kcal · 15.6g P / 100g)',
    image: '/foods/bread-high-protein.png',
    unit: 'slice',
    unitLabel: 'slice',
    defaultQty: 1,
    step: 1,
    // 27g/slice → 245*0.27 ≈ 66 kcal, 15.6*0.27 ≈ 4.2g protein
    caloriesPerUnit: 66,
    proteinPerUnit: 4.2,
    detail: '1 slice ≈ 27g · ~66 kcal · 4.2g protein',
  },
  {
    id: 'double-toned-milk',
    name: 'Double Toned Milk',
    brand: '450ml packet (47 kcal · 3.3g P / 100ml)',
    image: '/foods/double-toned-milk.png',
    unit: 'packet',
    unitLabel: 'packet',
    defaultQty: 1,
    step: 1,
    // 450ml → 47*4.5 = 211.5 ≈ 212 kcal; 3.3*4.5 = 14.85 ≈ 14.9g protein
    caloriesPerUnit: 212,
    proteinPerUnit: 14.9,
    detail: '1 packet 450ml · ~212 kcal · 14.9g protein',
  },
  {
    id: 'amul-tetra-pack',
    name: 'Amul Tetra Pack',
    brand: 'Amul milk tetra pack · 1 packet',
    image: '/foods/amul-tetra-pack.png',
    unit: 'packet',
    unitLabel: 'packet',
    defaultQty: 1,
    step: 1,
    caloriesPerUnit: 116,
    proteinPerUnit: 6,
    detail: '1 packet · 116 kcal · 6g protein',
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    brand: 'Average whole cucumber',
    image: '/foods/cucumber.png',
    unit: 'piece',
    unitLabel: 'piece',
    defaultQty: 1,
    step: 1,
    // ~200g medium · ~15 kcal / 0.65g P per 100g → ~30 kcal · 1.3g protein
    caloriesPerUnit: 30,
    proteinPerUnit: 1.3,
    detail: 'Est. 1 medium (~200g) · ~30 kcal · 1.3g protein',
  },
  {
    id: 'tomato',
    name: 'Tomato',
    brand: 'Average medium tomato',
    image: '/foods/tomato.png',
    unit: 'piece',
    unitLabel: 'piece',
    defaultQty: 1,
    step: 1,
    // ~120g medium · ~18 kcal / 0.9g P per 100g → ~22 kcal · 1.1g protein
    caloriesPerUnit: 22,
    proteinPerUnit: 1.1,
    detail: 'Est. 1 medium (~120g) · ~22 kcal · 1.1g protein',
  },
  {
    id: 'banana',
    name: 'Banana',
    brand: 'Medium banana (household)',
    image: '/foods/banana.png',
    unit: 'piece',
    unitLabel: 'banana',
    defaultQty: 1,
    step: 1,
    // Medium ~118g edible: ~105 kcal · ~1.3g protein
    caloriesPerUnit: 105,
    proteinPerUnit: 1.3,
    detail: '1 medium · ~105 kcal · 1.3g protein',
  },
  {
    id: 'cooked-rice',
    name: 'Cooked Rice',
    brand: 'Weighed after cooking (on the plate)',
    image: '/foods/cooked-rice.png',
    unit: 'g',
    unitLabel: 'g',
    defaultQty: 200,
    step: 50,
    // ~130 kcal / 2.7g protein per 100g cooked white rice
    caloriesPerUnit: 1.3,
    proteinPerUnit: 0.027,
    detail: '~130 kcal · 2.7g protein / 100g cooked · default 200g plate',
  },
  {
    id: 'hp-muesli',
    name: 'High Protein Muesli',
    brand: 'HP muesli (386 kcal · 23g P / 100g)',
    image: '/foods/hp-muesli.png',
    unit: 'g',
    unitLabel: 'g',
    defaultQty: 40,
    step: 10,
    caloriesPerUnit: 3.86, // 386 / 100
    proteinPerUnit: 0.23, // 23 / 100
    detail: '386 kcal · 23g protein / 100g · default 40g bowl',
  },
  {
    id: 'hp-oats',
    name: 'High Protein Oats',
    brand: 'HP oats (392 kcal · 26g P / 100g)',
    image: '/foods/hp-oats.png',
    unit: 'g',
    unitLabel: 'g',
    defaultQty: 40,
    step: 10,
    caloriesPerUnit: 3.92, // 392 / 100
    proteinPerUnit: 0.26, // 26 / 100
    detail: '392 kcal · 26g protein / 100g · default 40g serving',
  },
  {
    id: 'superyou-protein',
    name: 'SuperYou Protein',
    brand: 'SuperYou Protein Shake',
    image: '/foods/superyou-protein.png',
    unit: 'shake',
    unitLabel: 'shake',
    defaultQty: 1,
    step: 1,
    caloriesPerUnit: 134,
    proteinPerUnit: 27,
    detail: '1 shake · 134 kcal · 27g protein',
  },
  {
    id: 'whole-truth-whey',
    name: 'Whole Truth Whey',
    brand: 'Whole Truth Whey Protein Shake',
    image: '/foods/whole-truth-whey.png',
    unit: 'shake',
    unitLabel: 'shake',
    defaultQty: 1,
    step: 1,
    caloriesPerUnit: 135,
    proteinPerUnit: 26.5,
    detail: '1 shake · 135 kcal · 26.5g protein',
  },
  {
    id: 'soya-bean',
    name: 'Soya Bean',
    brand: 'Soya beans (315 kcal · 53g P / 100g)',
    image: '/foods/soya-bean.png',
    unit: 'g',
    unitLabel: 'g',
    defaultQty: 50,
    step: 25,
    caloriesPerUnit: 3.15, // 315 / 100
    proteinPerUnit: 0.53, // 53 / 100
    detail: '315 kcal · 53g protein / 100g · default 50g',
  },
  {
    id: 'protein-chips',
    name: 'Protein Chips',
    brand: 'Protein chips packet',
    image: '/foods/protein-chips.png',
    unit: 'packet',
    unitLabel: 'packet',
    defaultQty: 1,
    step: 1,
    caloriesPerUnit: 169,
    proteinPerUnit: 10,
    detail: '1 packet · 169 kcal · 10g protein',
  },
  {
    id: 'cheese-slice',
    name: 'Cheese Slice',
    brand: 'Cheese slice (311 kcal · 20g P / 100g)',
    image: '/foods/cheese-slice.png',
    unit: 'slice',
    unitLabel: 'slice',
    defaultQty: 1,
    step: 1,
    // 20g/slice → 311*0.2 = 62.2 ≈ 62 kcal; 20*0.2 = 4g protein
    caloriesPerUnit: 62,
    proteinPerUnit: 4,
    detail: '1 slice = 20g · ~62 kcal · 4g protein',
  },
  {
    id: 'masala-dosa',
    name: 'Masala Dosa',
    brand: 'Restaurant / hotel (avg plate)',
    image: '/foods/masala-dosa.png',
    unit: 'piece',
    unitLabel: 'dosa',
    defaultQty: 1,
    step: 1,
    // Typical restaurant masala dosa ~350–450 kcal · 7–10g P
    caloriesPerUnit: 400,
    proteinPerUnit: 8,
    detail: 'Avg 1 plate · ~400 kcal · 8g protein',
  },
  {
    id: 'veg-burger',
    name: 'Veg Burger',
    brand: 'McAloo Tikki / BK Crispy Veg avg',
    image: '/foods/veg-burger.png',
    unit: 'piece',
    unitLabel: 'burger',
    defaultQty: 1,
    step: 1,
    // McAloo Tikki ~340 kcal · 8.5g P; BK Crispy Veg ~362 kcal · 8.4g P
    caloriesPerUnit: 350,
    proteinPerUnit: 8.5,
    detail: '1 burger · ~350 kcal · 8.5g protein',
  },
  {
    id: 'rajma',
    name: 'Rajma',
    brand: 'Cooked curry · 1 regular bowl',
    image: '/foods/rajma.png',
    unit: 'bowl',
    unitLabel: 'bowl',
    defaultQty: 1,
    step: 1,
    // Home bowl ~200g: ~200–240 kcal · ~10–12g P
    caloriesPerUnit: 220,
    proteinPerUnit: 12,
    detail: '1 bowl cooked · ~220 kcal · 12g protein',
  },
  {
    id: 'chole',
    name: 'Chole',
    brand: 'Chana masala · 1 regular bowl',
    image: '/foods/chole.png',
    unit: 'bowl',
    unitLabel: 'bowl',
    defaultQty: 1,
    step: 1,
    // Bowl ~200g: ~220–280 kcal · ~13g P
    caloriesPerUnit: 250,
    proteinPerUnit: 13,
    detail: '1 bowl cooked · ~250 kcal · 13g protein',
  },
  {
    id: 'dal',
    name: 'Dal',
    brand: 'Any dal (toor / moong / masoor / urad / chana)',
    image: '/foods/dal.png',
    unit: 'bowl',
    unitLabel: 'bowl',
    defaultQty: 1,
    step: 1,
    // Avg tadka/fry bowl a normal person eats
    caloriesPerUnit: 180,
    proteinPerUnit: 10,
    detail: '1 bowl cooked · ~180 kcal · 10g protein',
  },
  {
    id: 'samosa',
    name: 'Samosa',
    brand: 'Veg / potato · medium street or bakery',
    image: '/foods/samosa.png',
    unit: 'piece',
    unitLabel: 'samosa',
    defaultQty: 1,
    step: 1,
    // Medium ~70–90g: ~150–200 kcal · ~4–5g P
    caloriesPerUnit: 180,
    proteinPerUnit: 4,
    detail: '1 piece · ~180 kcal · 4g protein',
  },
  {
    id: 'bread-pakora',
    name: 'Bread Pakora',
    brand: 'Potato-stuffed · deep-fried',
    image: '/foods/bread-pakora.png',
    unit: 'piece',
    unitLabel: 'pakora',
    defaultQty: 1,
    step: 1,
    // Typical tea-stall bread pakora ~280–320 kcal · ~6–8g P
    caloriesPerUnit: 300,
    proteinPerUnit: 7,
    detail: '1 piece · ~300 kcal · 7g protein',
  },
  {
    id: 'taco-bell-potato-taco',
    name: 'Potato Taco',
    brand: 'Taco Bell India · Fiesta / Crispy Potato Taco',
    image: '/foods/taco-bell-potato-taco.png',
    unit: 'piece',
    unitLabel: 'taco',
    defaultQty: 1,
    step: 1,
    // Official Taco Bell India nutrition: Fiesta Taco - Potato
    caloriesPerUnit: 200,
    proteinPerUnit: 4.5,
    detail: '1 taco · 200 kcal · 4.5g protein',
  },
  {
    id: 'plain-curd',
    name: 'Curd',
    brand: 'Plain dahi · regular Indian curd',
    image: '/foods/plain-curd.png',
    unit: 'bowl',
    unitLabel: 'bowl',
    defaultQty: 1,
    step: 1,
    // ~62 kcal · 3.5g P / 100g; 1 bowl ≈ 200g
    caloriesPerUnit: 124,
    proteinPerUnit: 7,
    detail: '1 bowl ≈ 200g · ~124 kcal · 7g protein',
  },
  {
    id: 'kaju',
    name: 'Kaju',
    brand: 'Raw cashew · one kernel',
    image: '/foods/kaju.png',
    unit: 'piece',
    unitLabel: 'piece',
    defaultQty: 1,
    step: 1,
    // USDA-style raw cashew ~553 kcal · 18.2g P / 100g; 1 kernel ≈ 1.6g
    caloriesPerUnit: 9,
    proteinPerUnit: 0.3,
    detail: '1 piece · ~9 kcal · 0.3g protein',
  },
  {
    id: 'namkeen',
    name: 'Namkeen',
    brand: 'Average mixture / bhujia',
    image: '/foods/namkeen.png',
    unit: 'bowl',
    unitLabel: 'bowl',
    defaultQty: 1,
    step: 1,
    // Avg mixture ~540 kcal · 14g P / 100g; small katori ≈ 30g
    caloriesPerUnit: 160,
    proteinPerUnit: 4,
    detail: 'Est. 1 small bowl (~30g) · ~160 kcal · 4g protein',
  },
];
