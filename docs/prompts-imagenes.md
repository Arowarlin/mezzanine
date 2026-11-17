# Prompts para imágenes generadas con IA — Mezzanine

Imágenes **provisionales** para los platos y bebidas que todavía no tienen foto real. Ahora mismo esos huecos están cubiertos con fotos de Unsplash (ver `docs/creditos-fotos.md`). Estos prompts sirven si prefieres generar imágenes con IA: guarda cada una con el mismo nombre y sustituirá a la de Unsplash.

Total: **48 imágenes**.

## Cómo usarlas

1. Genera cada imagen con tu herramienta de IA (ChatGPT, Gemini, Midjourney, Leonardo, etc.), en formato vertical 4:5.
2. Guárdala en `client/public/photos/menu/` con el **nombre exacto** indicado (`.jpg`, `.png` o `.webp`). Ejemplo: `client/public/photos/menu/burger.jpg`.
3. Ejecuta `npm run db:seed`. El seed detecta la imagen y la usa; si falta alguna, se sigue mostrando la ilustración SVG.
4. Recomendado: tamaño de 1200–1800 px de alto y menos de 400 KB por imagen.

> Las imágenes generadas no son fotos de los platos reales. La página Eat ya avisa de que son ilustrativas. Sustitúyelas por fotos reales en cuanto sea posible.

## Estilo común

Cada prompt de abajo ya incluye este estilo, para que todas las imágenes combinen con las fotos reales del Instagram. Si generas varias en la misma conversación, puedes pegar el estilo una sola vez y luego solo la primera frase de cada prompt.

**Comida:**

```
Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

**Bebidas:**

```
Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

## Comida (24)

### `ahi-tuna-tacos`

Para: Ahi Tuna Tacos

```
Ahi Tuna Tacos: Fresh ahi tuna seared rare w/ habanero-cherry slaw, avocado crema, scallions, sesame oil, soy sauce, sesame seeds & organic cilantro micro-greens. Served w/ fries or fresh watermelon. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `blta-wrap`

Para: Nueske's BLTA Wrap

```
Nueske's BLTA Wrap: Thick-cut nueske's applewood smoked bacon, tomato, fresh greens, guacamole & garlic aioli. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `burger`

Para: Mezzanine Burger

```
Mezzanine Burger: Hand-pattied 1/2 lb burger w/ pepperjack cheese, green leaf lettuce, avocado, tomato & ancho-garlic aioli. Served w/ fries or fresh watermelon. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `capellini`

Para: Red Pepper & Basil Oil Capellini

```
Red Pepper & Basil Oil Capellini: Fried garlic w/ spicy red pepper flakes, white wine & lime juice. Tossed w/ capellini & finished w/ basil-infused olive oil & shaved parmesan romano. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `capellini-mussels`

Para: Red Pepper & Basil Oil Capellini & Mussels

```
Red Pepper & Basil Oil Capellini & Mussels: Fried garlic & fresh mussels w/ spicy red pepper flakes, white wine & lime juice. Tossed w/ capellini & finished w/ basil-infused olive oil & shaved parmesan romano. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `center-cut-chop`

Para: Breaded Center Cut Chop

```
Breaded Center Cut Chop: Lightly breaded & pan-fried pork medallions, served w/ garlic mashed potatoes, parmesan-romano asparagus & tropical salsa. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `cheese-curds`

Para: Beer-Battered Cheese Curds

```
Beer-Battered Cheese Curds: Beer-battered white wisconsin cheddar cheese curds. Served w/ choice of cherry preserves or ranch. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `cherry-crisp`

Para: Cherry Crisp

```
Cherry Crisp: A la mode w/ cinnamon ice cream +$2.50. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `cherry-salad`

Para: Honey-Lime Cherry Salad / Half-Salad

```
Honey-Lime Cherry Salad / Half-Salad: Dried cherries, red onion, fresh berries, almonds, citrus supremes & field greens dressed w/ honey-lime vinaigrette. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `chili-lime-fries`

Para: Chili Lime Fries

```
Chili Lime Fries: Seasoned w/ our spicy adobo blend, lime juice, scallions, crema anejo & parmesan-romano. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `chimichurri-bread`

Para: Chimichurri Bread

```
Chimichurri Bread: Char-grilled rustic loaf served w/ chimichurri. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `guacamole`

Para: Guacamole

```
Guacamole: House-made guacamole served w/ chili-lime corn tortilla chips & lime wedges. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `guajillo-salmon`

Para: Guajillo Salmon

```
Guajillo Salmon: Chili-lime seasoned salmon grilled to medium & topped w/ a tropical mango-scallion salsa & avocado crema. Served over cilantro lime rice & salsa verde. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `lavender-flan`

Para: Lavender Flan

```
Lavender Flan:  Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `poke`

Para: Ahi Tuna Poke

```
Ahi Tuna Poke: Sashimi-grade ahi tuna, ginger, sesame oil, soy sauce, avocado crema, sesame seeds & green onion. Served w/ a medley of house-made malanga chips & white corn chips. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `shrimp-wrap`

Para: Crispy Avocado Shrimp Wrap

```
Crispy Avocado Shrimp Wrap: Crispy shrimp w/ habanero-cherry slaw, green leaf lettuce, guacamole, scallions, cilantro & crema anejo. Served w/ fries or fresh watermelon. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `skirt-steak`

Para: 8oz Certified Angus Skirt Steak

```
8oz Certified Angus Skirt Steak: Seared to medium rare & finished w/ chimichurri. Served w/ garlic mashed potatoes, chimichurri toast & parmesan romano asparagus. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `smash-salad`

Para: Avocado & Bacon Smash Salad

```
Avocado & Bacon Smash Salad: Cubed avocado, nueske's bacon, red onion, malanga crisps, parmesan-romano, alfalfa sprouts & field greens dressed w/ red wine-lemon vinaigrette & crushed red peppers. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `soup`

Para: Soup

```
A cup of creamy house soup of the day with a sprinkle of fresh herbs and a slice of toasted bread. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `whitefish-basket`

Para: Lake Michigan Whitefish Basket

```
Lake Michigan Whitefish Basket: Fried & breaded local whitefish w/ ancho-lime fries, house-made tartar, habanero-cherry slaw, buttered bread & lemon slices. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `whitefish-cakes`

Para: Lake Michigan Whitefish Cakes

```
Lake Michigan Whitefish Cakes: W/ ancho-garlic aioli, avocado crema, local whitefish, salmon belly & cilantro micro-greens. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `whitefish-platter`

Para: Lake Michigan Whitefish Platter

```
Lake Michigan Whitefish Platter: Pan fried local whitefish served w/ garlic mashed potatoes, parmesan-romano asparagus, buttered bread, house tartar & lemon wedges. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `whitefish-sandwich`

Para: Mezzanine Whitefish Sandwich

```
Mezzanine Whitefish Sandwich: Fried & breaded local whitefish w/ tartar sauce, green leaf lettuce, alfalfa sprouts & lemon wedges on a split roll. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

### `whitefish-tacos`

Para: Whitefish Tacos

```
Whitefish Tacos: Fried & breaded lake michigan whitefish served w/ habanero-cherry slaw, guacamole, scallions, cilantro & crema anejo. Professional restaurant food photography, 45-degree angle, served on a simple white or dark stoneware plate on a weathered rustic wooden table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan softly blurred in the background, natural colors, appetizing, realistic portion size, no people, no hands, no text, no logos, no watermarks. Vertical 4:5.
```

## Cócteles (10)

### `cocktail-cherry-mule`

Para: Cherry Mule

```
A "Cherry Mule" cocktail made with Door County cherry juice, vodka, lime juice, & ginger beer. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `cocktail-guava-a-love-story`

Para: Guava: A Love Story

```
A "Guava: A Love Story" cocktail made with Guava-ginger infused blanco tequila, simple syrup, & lime juice. Topped w/ edible flowers. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `cocktail-lavender-gin-fizz`

Para: Lavender Gin Fizz

```
A "Lavender Gin Fizz" cocktail made with Lavender-infused gin, lemon juice, simple syrup, seltzer. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `cocktail-lavender-lemon-drop-martini`

Para: Lavender Lemon Drop Martini

```
A "Lavender Lemon Drop Martini" cocktail made with House lavender infused vodka, lemon juice, simple syrup, sugar rim. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `cocktail-raspberry-mint-mojito`

Para: Raspberry Mint Mojito

```
A "Raspberry Mint Mojito" cocktail made with Raspberry-infused white rum, fresh mint, simple syrup, lime juice & seltzer. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `cocktail-supper-club-old-fashioned`

Para: Supper Club Old Fashioned

```
A "Supper Club Old Fashioned" cocktail made with Brandy, muddled orange and cherry, simple syrup & house bitters w/ choice of sweet or sour wash. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `cocktail-thai-basil-margarita`

Para: Thai Basil Margarita

```
A "Thai Basil Margarita" cocktail made with Thai basil, blanco tequila, simple syrup, & fresh lime juice. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `cocktail-watermelon-cilantro-margarita`

Para: Watermelon Cilantro Margarita

```
A "Watermelon Cilantro Margarita" cocktail made with Watermelon juice, cilantro infused tequila, fresh lime juice, & simple syrup. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `cocktail-watermelon-cucumber-cooler`

Para: Watermelon Cucumber Cooler

```
A "Watermelon Cucumber Cooler" cocktail made with House watermelon & cucumber infused vodka, lime juice, simple syrup & seltzer. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `cocktail-yolanda-be-cool`

Para: Yolanda Be Cool

```
A "Yolanda Be Cool" cocktail made with Vodka, strawberry-infused blanco tequila, habanero tincture, lime juice, & simple syrup. Garnish to match the ingredients. Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

## Vino (5)

### `wine-chardonnay`

Para: Austin Hope / Bulletin Place

```
A stemmed wine glass of golden chardonnay, half full. (for: Austin Hope / Bulletin Place). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `wine-red`

Para: Don Rodolfo / Casa Santos Lima / Treana / Ernesto Padrillos Catena / True Myth / Mesta

```
A stemmed wine glass of deep ruby red wine, half full. (for: Don Rodolfo / Casa Santos Lima / Treana / Ernesto Padrillos Catena / True Myth / Mesta). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `wine-rose`

Para: Door 44 Petite Rosé / L'Agnostique Rosé

```
A stemmed wine glass of pale salmon-pink dry rosé, half full. (for: Door 44 Petite Rosé / L'Agnostique Rosé). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `wine-sparkling`

Para: Los Monteros

```
A champagne flute of Spanish cava with fine rising bubbles. (for: Los Monteros). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `wine-white`

Para: Innocent Bystander / Freixenet / Tarrica

```
A stemmed wine glass of pale straw-colored crisp white wine (sauvignon blanc / pinot grigio / riesling), half full. (for: Innocent Bystander / Freixenet / Tarrica). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

## Cerveza y sidra (9)

### `beer-amber`

Para: Ouisconsing

```
A pint glass of clear copper-red amber ale with an off-white head. (Ouisconsing). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `beer-blonde`

Para: Honey Blonde

```
A pint glass of light golden cream ale with a soft white head. (Honey Blonde). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `beer-cherry`

Para: Cherry Wheat

```
A pint glass of hazy wheat ale with a subtle cherry-amber tint, a few Door County cherries beside it. (Cherry Wheat). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `beer-cherry-lager`

Para: Cherry Lager

```
A pint glass of clear ruby-red cherry lager with a pink-tinged head, fresh cherries beside it. (Cherry Lager). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `beer-cider`

Para: Island Orchard Cider

```
A glass of sparkling pale-gold apple cider, a fresh apple beside it. (Island Orchard Cider). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `beer-hazy`

Para: Chaos Pattern

```
A pint glass of opaque, juicy hazy IPA, cloudy orange-yellow, with a creamy head. (Chaos Pattern). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `beer-ipa`

Para: All Day IPA

```
A pint glass of clear golden-amber session IPA with a white foam head. (All Day IPA). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `beer-pilsner`

Para: Narragansett

```
A pint glass of crisp, clear pale golden pilsner with a thin white head. (Narragansett). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```

### `beer-wheat`

Para: Little Sister

```
A pint glass of cloudy pale wheat ale with a fluffy white head. (Little Sister). Professional cocktail and beverage photography, glass on a weathered rustic wooden bar table on an outdoor rooftop terrace, warm golden-hour sunlight, shallow depth of field with Lake Michigan and patio umbrellas softly blurred in the background, condensation on the glass, realistic, no people, no hands, no text, no visible brand labels or logos, no watermarks. Vertical 4:5.
```
