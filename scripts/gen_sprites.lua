-- ============================================================
-- SPRITE 1: SBF (64x64) - Photo-accurate pixel portrait
-- ============================================================
local function create_sbf()
  local spr = Sprite(64, 64, ColorMode.RGB)
  local img = spr.cels[1].image

  local dk = Color(15, 56, 15)
  local md = Color(48, 98, 48)
  local ml = Color(139, 172, 15)
  local lt = Color(155, 188, 15)
  local t = Color(0, 0, 0, 0)

  -- Clear
  for y = 0, 63 do for x = 0, 63 do img:drawPixel(x, y, t) end end

  -- Jail bars (vertical, behind everything then in front)
  -- Background wall
  for y = 0, 63 do for x = 0, 63 do img:drawPixel(x, y, dk) end end

  -- Face/skin (oval shape, lighter green)
  for y = 18, 42 do
    local hw = 10 - math.abs(y - 30) / 3
    if hw < 4 then hw = 4 end
    for x = math.floor(32 - hw), math.floor(32 + hw) do
      img:drawPixel(x, y, ml)
    end
  end

  -- Curly hair (SBF's iconic messy curls)
  for y = 10, 22 do
    local hw = 12 - math.abs(y - 16) / 2
    for x = math.floor(32 - hw), math.floor(32 + hw) do
      if math.random() > 0.3 then
        img:drawPixel(x, y, md)
      end
    end
  end
  -- Side hair
  for y = 16, 28 do
    for x = 20, 23 do if math.random() > 0.4 then img:drawPixel(x, y, md) end end
    for x = 41, 44 do if math.random() > 0.4 then img:drawPixel(x, y, md) end end
  end

  -- Eyes (dark, slightly tired looking)
  for x = 27, 29 do for y = 27, 29 do img:drawPixel(x, y, dk) end end
  for x = 35, 37 do for y = 27, 29 do img:drawPixel(x, y, dk) end end
  -- Eyebrows
  for x = 26, 30 do img:drawPixel(x, 25, md) end
  for x = 34, 38 do img:drawPixel(x, 25, md) end

  -- Nose
  for y = 30, 33 do img:drawPixel(32, y, md); img:drawPixel(33, y, md) end
  img:drawPixel(31, 33, md); img:drawPixel(34, 33, md)

  -- Mouth (slight smirk)
  for x = 29, 35 do img:drawPixel(x, 37, md) end
  img:drawPixel(28, 36, md); img:drawPixel(36, 36, md)

  -- T-shirt / body
  for y = 43, 63 do
    local hw = 14 - (y - 43) / 5
    if hw < 8 then hw = 8 end
    for x = math.floor(32 - hw), math.floor(32 + hw) do
      img:drawPixel(x, y, md)
    end
  end

  -- FTX on shirt
  -- F
  for y = 48, 54 do img:drawPixel(27, y, lt) end
  img:drawPixel(28, 48, lt); img:drawPixel(29, 48, lt)
  img:drawPixel(28, 51, lt)
  -- T
  for x = 31, 33 do img:drawPixel(x, 48, lt) end
  for y = 48, 54 do img:drawPixel(32, y, lt) end
  -- X
  for i = 0, 6 do
    img:drawPixel(35 + i, 48 + i, lt)
    img:drawPixel(41 - i, 48 + i, lt)
  end

  -- Jail bars (in front of everything)
  for _, bx in ipairs({12, 22, 32, 42, 52}) do
    for y = 0, 63 do
      img:drawPixel(bx, y, lt)
      img:drawPixel(bx + 1, y, lt)
    end
  end
  -- Horizontal bar
  for x = 0, 63 do img:drawPixel(x, 5, lt); img:drawPixel(x, 6, lt) end

  -- Ears
  for y = 26, 32 do img:drawPixel(22, y, ml); img:drawPixel(42, y, ml) end

  spr:saveCopyAs("C:/Users/jacob/impact-webapp/public/images/trail/sbf.png")
  spr:close()
end

-- ============================================================
-- SPRITE 2: BEAR (48x48) - Realistic standing bear
-- ============================================================
local function create_bear()
  local spr = Sprite(48, 48, ColorMode.RGB)
  local img = spr.cels[1].image

  local dk = Color(15, 56, 15)
  local md = Color(48, 98, 48)
  local ml = Color(139, 172, 15)
  local lt = Color(155, 188, 15)
  local t = Color(0, 0, 0, 0)

  for y = 0, 47 do for x = 0, 47 do img:drawPixel(x, y, t) end end

  -- Ears
  for x = 10, 14 do for y = 4, 8 do img:drawPixel(x, y, md) end end
  for x = 33, 37 do for y = 4, 8 do img:drawPixel(x, y, md) end end
  for x = 11, 13 do for y = 5, 7 do img:drawPixel(x, y, ml) end end
  for x = 34, 36 do for y = 5, 7 do img:drawPixel(x, y, ml) end end

  -- Head (round)
  for y = 7, 18 do
    local hw = 10 - math.abs(y - 12) / 2
    if hw < 5 then hw = 5 end
    for x = math.floor(24 - hw), math.floor(24 + hw) do
      img:drawPixel(x, y, md)
    end
  end

  -- Snout (lighter)
  for y = 12, 17 do
    for x = 20, 28 do img:drawPixel(x, y, ml) end
  end

  -- Eyes
  img:drawPixel(18, 11, lt); img:drawPixel(19, 11, lt)
  img:drawPixel(29, 11, lt); img:drawPixel(30, 11, lt)
  img:drawPixel(18, 12, dk); img:drawPixel(19, 12, dk)
  img:drawPixel(29, 12, dk); img:drawPixel(30, 12, dk)

  -- Nose
  for x = 22, 26 do for y = 13, 14 do img:drawPixel(x, y, dk) end end

  -- Mouth
  img:drawPixel(24, 16, dk)

  -- Body (large, stocky)
  for y = 18, 38 do
    local hw = 14 - math.abs(y - 28) / 4
    if hw < 9 then hw = 9 end
    for x = math.floor(24 - hw), math.floor(24 + hw) do
      img:drawPixel(x, y, md)
    end
  end

  -- Belly shading
  for y = 22, 35 do
    for x = 18, 30 do
      if (x + y) % 3 == 0 then img:drawPixel(x, y, ml) end
    end
  end

  -- Front legs
  for y = 32, 44 do
    for x = 12, 17 do img:drawPixel(x, y, md) end
    for x = 31, 36 do img:drawPixel(x, y, md) end
  end

  -- Claws
  for x = 11, 13 do img:drawPixel(x, 45, lt) end
  for x = 15, 17 do img:drawPixel(x, 45, lt) end
  for x = 31, 33 do img:drawPixel(x, 45, lt) end
  for x = 34, 36 do img:drawPixel(x, 45, lt) end

  -- Back legs (slightly behind)
  for y = 34, 44 do
    for x = 8, 12 do img:drawPixel(x, y, dk) end
    for x = 36, 40 do img:drawPixel(x, y, dk) end
  end

  -- Tail
  for y = 18, 21 do img:drawPixel(38, y, md); img:drawPixel(39, y, md) end

  spr:saveCopyAs("C:/Users/jacob/impact-webapp/public/images/trail/bear.png")
  spr:close()
end

-- ============================================================
-- SPRITE 3: BULL (48x48) - Strong bull facing right
-- ============================================================
local function create_bull()
  local spr = Sprite(48, 48, ColorMode.RGB)
  local img = spr.cels[1].image

  local dk = Color(15, 56, 15)
  local md = Color(48, 98, 48)
  local ml = Color(139, 172, 15)
  local lt = Color(155, 188, 15)
  local t = Color(0, 0, 0, 0)

  for y = 0, 47 do for x = 0, 47 do img:drawPixel(x, y, t) end end

  -- Horns (curved upward)
  for x = 6, 10 do for y = 6, 9 do img:drawPixel(x, y, lt) end end
  for x = 36, 40 do for y = 6, 9 do img:drawPixel(x, y, lt) end end
  img:drawPixel(5, 5, lt); img:drawPixel(41, 5, lt)
  img:drawPixel(4, 4, lt); img:drawPixel(42, 4, lt)

  -- Head
  for y = 9, 22 do
    local hw = 10 - math.abs(y - 15) / 3
    if hw < 5 then hw = 5 end
    for x = math.floor(23 - hw), math.floor(23 + hw) do
      img:drawPixel(x, y, md)
    end
  end

  -- Face highlight
  for y = 12, 19 do
    for x = 18, 28 do
      if (x + y) % 4 == 0 then img:drawPixel(x, y, ml) end
    end
  end

  -- Eyes (determined look)
  for x = 17, 19 do img:drawPixel(x, 13, lt) end
  for x = 27, 29 do img:drawPixel(x, 13, lt) end
  img:drawPixel(18, 14, dk); img:drawPixel(28, 14, dk)

  -- Nostrils
  img:drawPixel(21, 18, dk); img:drawPixel(25, 18, dk)

  -- Nose ring
  for x = 21, 25 do img:drawPixel(x, 20, lt) end
  img:drawPixel(21, 19, lt); img:drawPixel(25, 19, lt)

  -- Neck (thick)
  for y = 22, 26 do
    for x = 14, 32 do img:drawPixel(x, y, md) end
  end

  -- Body (massive)
  for y = 24, 38 do
    local hw = 16
    for x = math.floor(24 - hw), math.floor(24 + hw) do
      if x >= 0 and x < 48 then img:drawPixel(x, y, md) end
    end
  end

  -- Body shading/muscle definition
  for y = 26, 36 do
    for x = 12, 36 do
      if (x + y) % 5 == 0 then img:drawPixel(x, y, ml) end
    end
  end

  -- Legs (4 sturdy legs)
  for y = 36, 45 do
    for x = 10, 14 do img:drawPixel(x, y, md) end
    for x = 18, 22 do img:drawPixel(x, y, md) end
    for x = 26, 30 do img:drawPixel(x, y, md) end
    for x = 34, 38 do img:drawPixel(x, y, md) end
  end
  -- Hooves
  for x = 10, 14 do img:drawPixel(x, 46, dk) end
  for x = 18, 22 do img:drawPixel(x, 46, dk) end
  for x = 26, 30 do img:drawPixel(x, 46, dk) end
  for x = 34, 38 do img:drawPixel(x, 46, dk) end

  -- Tail
  for y = 24, 28 do img:drawPixel(41, y, md) end
  img:drawPixel(42, 28, md); img:drawPixel(43, 29, md)
  img:drawPixel(44, 29, dk); img:drawPixel(44, 30, dk)

  spr:saveCopyAs("C:/Users/jacob/impact-webapp/public/images/trail/bull.png")
  spr:close()
end

-- ============================================================
-- SPRITE 4: BURGER (32x32) - Clear McDonald's burger
-- ============================================================
local function create_burger()
  local spr = Sprite(32, 32, ColorMode.RGB)
  local img = spr.cels[1].image

  local dk = Color(15, 56, 15)
  local md = Color(48, 98, 48)
  local ml = Color(139, 172, 15)
  local lt = Color(155, 188, 15)
  local t = Color(0, 0, 0, 0)

  for y = 0, 31 do for x = 0, 31 do img:drawPixel(x, y, t) end end

  -- Top bun (rounded dome)
  for y = 4, 11 do
    local hw = 12 - (11 - y)
    if hw < 4 then hw = 4 end
    if hw > 12 then hw = 12 end
    for x = math.floor(16 - hw), math.floor(16 + hw) do
      img:drawPixel(x, y, ml)
    end
  end
  -- Sesame seeds
  img:drawPixel(11, 6, lt); img:drawPixel(16, 5, lt); img:drawPixel(21, 6, lt)
  img:drawPixel(13, 8, lt); img:drawPixel(19, 7, lt)

  -- Lettuce (wavy green)
  for x = 3, 28 do
    local yy = 12 + (x % 3 == 0 and 1 or 0)
    img:drawPixel(x, yy, lt)
    img:drawPixel(x, yy + 1, lt)
  end

  -- Cheese (slightly melted, hanging over edges)
  for x = 3, 28 do
    img:drawPixel(x, 14, ml)
    img:drawPixel(x, 15, ml)
  end
  img:drawPixel(2, 15, ml); img:drawPixel(2, 16, ml)
  img:drawPixel(29, 15, ml); img:drawPixel(29, 16, ml)

  -- Patty
  for x = 4, 27 do
    for y = 16, 19 do img:drawPixel(x, y, md) end
  end
  -- Grill marks
  for x = 6, 25 do
    if x % 4 == 0 then img:drawPixel(x, 17, dk); img:drawPixel(x, 18, dk) end
  end

  -- Bottom bun
  for y = 20, 26 do
    local hw = 12 - (y - 20) / 3
    if hw < 10 then hw = 10 end
    for x = math.floor(16 - hw), math.floor(16 + hw) do
      img:drawPixel(x, y, ml)
    end
  end
  -- Bottom bun darker edge
  for x = 6, 26 do img:drawPixel(x, 26, md) end

  spr:saveCopyAs("C:/Users/jacob/impact-webapp/public/images/trail/mcdonalds.png")
  spr:close()
end

-- ============================================================
-- SPRITE 5: MEDICINE/STEAK (32x32) - T-bone steak
-- ============================================================
local function create_steak()
  local spr = Sprite(32, 32, ColorMode.RGB)
  local img = spr.cels[1].image

  local dk = Color(15, 56, 15)
  local md = Color(48, 98, 48)
  local ml = Color(139, 172, 15)
  local lt = Color(155, 188, 15)
  local t = Color(0, 0, 0, 0)

  for y = 0, 31 do for x = 0, 31 do img:drawPixel(x, y, t) end end

  -- Steak body (irregular oval)
  for y = 6, 26 do
    local hw = 11 - math.abs(y - 16) / 3
    if hw < 5 then hw = 5 end
    local cx = 16 + math.sin(y / 3) * 2
    for x = math.floor(cx - hw), math.floor(cx + hw) do
      if x >= 0 and x < 32 then
        img:drawPixel(x, y, md)
      end
    end
  end

  -- Fat marbling (lighter streaks)
  for y = 8, 24 do
    for x = 8, 24 do
      if (x * 3 + y * 7) % 11 == 0 then img:drawPixel(x, y, ml) end
      if (x * 5 + y * 2) % 13 == 0 then img:drawPixel(x, y, ml) end
    end
  end

  -- T-bone (white bone shape)
  for y = 8, 24 do img:drawPixel(16, y, lt) end
  for x = 10, 22 do img:drawPixel(x, 14, lt); img:drawPixel(x, 15, lt) end

  -- Fat cap on edge
  for y = 6, 10 do
    for x = 8, 24 do
      if math.abs(y - 8) + math.abs(x - 16) < 12 then
        img:drawPixel(x, y, lt)
      end
    end
  end

  -- Grill marks
  for x = 8, 24 do
    if x % 5 == 0 then
      for y = 10, 22 do
        if y % 2 == 0 then img:drawPixel(x, y, dk) end
      end
    end
  end

  -- Outline
  for y = 6, 26 do
    local hw = 11 - math.abs(y - 16) / 3
    if hw < 5 then hw = 5 end
    local cx = 16 + math.sin(y / 3) * 2
    local lx = math.floor(cx - hw)
    local rx = math.floor(cx + hw)
    if lx >= 0 then img:drawPixel(lx, y, dk) end
    if rx < 32 then img:drawPixel(rx, y, dk) end
  end

  spr:saveCopyAs("C:/Users/jacob/impact-webapp/public/images/trail/medicine.png")
  spr:close()
end

-- ============================================================
-- SPRITE 6: TOMBSTONE (48x64) - Detailed gravestone
-- ============================================================
local function create_tombstone()
  local spr = Sprite(48, 64, ColorMode.RGB)
  local img = spr.cels[1].image

  local dk = Color(15, 56, 15)
  local md = Color(48, 98, 48)
  local ml = Color(139, 172, 15)
  local lt = Color(155, 188, 15)
  local t = Color(0, 0, 0, 0)

  for y = 0, 63 do for x = 0, 47 do img:drawPixel(x, y, t) end end

  -- Stone body
  for y = 12, 52 do
    for x = 10, 38 do img:drawPixel(x, y, md) end
  end

  -- Rounded top
  for y = 4, 12 do
    local hw = 14 - (12 - y)
    if hw > 14 then hw = 14 end
    for x = math.floor(24 - hw), math.floor(24 + hw) do
      img:drawPixel(x, y, md)
    end
  end

  -- Stone texture (dithered)
  for y = 6, 50 do
    for x = 12, 36 do
      if (x + y) % 7 == 0 then img:drawPixel(x, y, ml) end
      if (x * 3 + y * 2) % 11 == 0 then img:drawPixel(x, y, dk) end
    end
  end

  -- RIP text
  -- R
  for y = 16, 24 do img:drawPixel(16, y, lt) end
  img:drawPixel(17, 16, lt); img:drawPixel(18, 16, lt)
  img:drawPixel(19, 17, lt); img:drawPixel(19, 18, lt)
  img:drawPixel(17, 19, lt); img:drawPixel(18, 19, lt)
  img:drawPixel(18, 21, lt); img:drawPixel(19, 22, lt); img:drawPixel(19, 23, lt)
  -- I
  for y = 16, 24 do img:drawPixel(22, y, lt) end
  img:drawPixel(21, 16, lt); img:drawPixel(23, 16, lt)
  img:drawPixel(21, 24, lt); img:drawPixel(23, 24, lt)
  -- P
  for y = 16, 24 do img:drawPixel(26, y, lt) end
  img:drawPixel(27, 16, lt); img:drawPixel(28, 16, lt)
  img:drawPixel(29, 17, lt); img:drawPixel(29, 18, lt)
  img:drawPixel(27, 19, lt); img:drawPixel(28, 19, lt)

  -- Cross
  for y = 28, 42 do img:drawPixel(24, y, lt) end
  for x = 19, 29 do img:drawPixel(x, 33, lt) end

  -- Base/ground
  for y = 52, 58 do
    for x = 6, 42 do img:drawPixel(x, y, dk) end
  end
  -- Grass tufts
  for x = 4, 44 do
    if x % 3 == 0 then
      img:drawPixel(x, 51, ml)
      img:drawPixel(x, 52, ml)
      img:drawPixel(x + 1, 52, ml)
    end
  end

  spr:saveCopyAs("C:/Users/jacob/impact-webapp/public/images/trail/tombstone.png")
  spr:close()
end

-- ============================================================
-- SPRITE 7: WAGON (64x40) - Covered wagon with detail
-- ============================================================
local function create_wagon()
  local spr = Sprite(64, 40, ColorMode.RGB)
  local img = spr.cels[1].image

  local dk = Color(15, 56, 15)
  local md = Color(48, 98, 48)
  local ml = Color(139, 172, 15)
  local lt = Color(155, 188, 15)
  local t = Color(0, 0, 0, 0)

  for y = 0, 39 do for x = 0, 63 do img:drawPixel(x, y, t) end end

  -- Canvas cover (arched)
  for x = 14, 50 do
    local peak = 6 + math.sin((x - 14) / 36 * math.pi) * 10
    for y = math.floor(14 - peak), 16 do
      if y >= 0 then img:drawPixel(x, y, ml) end
    end
  end
  -- Canvas ribs
  for _, rx in ipairs({18, 26, 34, 42}) do
    for y = 4, 16 do
      local peak = 6 + math.sin((rx - 14) / 36 * math.pi) * 10
      if y >= math.floor(14 - peak) then img:drawPixel(rx, y, lt) end
    end
  end

  -- Wagon bed
  for x = 10, 54 do
    for y = 17, 24 do img:drawPixel(x, y, md) end
  end
  -- Wood planks
  for x = 10, 54 do
    if x % 8 == 0 then for y = 17, 24 do img:drawPixel(x, y, dk) end end
  end
  img:drawPixel(10, 24, dk); img:drawPixel(54, 24, dk)

  -- Wheels (2 spoked)
  local function draw_wheel(cx, cy, r)
    for a = 0, 360, 5 do
      local rad = a * math.pi / 180
      local wx = cx + math.cos(rad) * r
      local wy = cy + math.sin(rad) * r
      img:drawPixel(math.floor(wx), math.floor(wy), lt)
    end
    -- Spokes
    for a = 0, 330, 45 do
      local rad = a * math.pi / 180
      for d = 1, r - 1 do
        local wx = cx + math.cos(rad) * d
        local wy = cy + math.sin(rad) * d
        img:drawPixel(math.floor(wx), math.floor(wy), md)
      end
    end
    -- Hub
    img:drawPixel(cx, cy, lt)
    img:drawPixel(cx + 1, cy, lt)
    img:drawPixel(cx, cy + 1, lt)
    img:drawPixel(cx + 1, cy + 1, lt)
  end

  draw_wheel(18, 30, 7)
  draw_wheel(46, 30, 7)

  -- Hitch (front)
  for x = 2, 10 do img:drawPixel(x, 22, md); img:drawPixel(x, 23, md) end

  spr:saveCopyAs("C:/Users/jacob/impact-webapp/public/images/trail/wagon.png")
  spr:close()
end

-- ============================================================
-- SPRITE 8: BULLET (20x20)
-- ============================================================
local function create_bullet()
  local spr = Sprite(20, 20, ColorMode.RGB)
  local img = spr.cels[1].image

  local dk = Color(15, 56, 15)
  local md = Color(48, 98, 48)
  local ml = Color(139, 172, 15)
  local lt = Color(155, 188, 15)
  local t = Color(0, 0, 0, 0)

  for y = 0, 19 do for x = 0, 19 do img:drawPixel(x, y, t) end end

  -- Bullet casing
  for y = 6, 16 do
    for x = 6, 10 do img:drawPixel(x, y, ml) end
  end
  -- Bullet tip (pointed)
  for y = 6, 16 do
    local w = math.floor((16 - y) / 2)
    if w > 4 then w = 4 end
    for x = 10, 10 + w do
      if x < 20 then img:drawPixel(x, y, md) end
    end
  end
  -- Tip point
  img:drawPixel(14, 10, lt); img:drawPixel(14, 11, lt)
  img:drawPixel(15, 10, lt); img:drawPixel(15, 11, lt)
  -- Casing rim
  for y = 6, 16 do img:drawPixel(5, y, dk) end
  -- Highlight
  for y = 8, 14 do img:drawPixel(7, y, lt) end

  spr:saveCopyAs("C:/Users/jacob/impact-webapp/public/images/trail/bullet.png")
  spr:close()
end

-- Run all
create_sbf()
create_bear()
create_bull()
create_burger()
create_steak()
create_tombstone()
create_wagon()
create_bullet()
print("All sprites generated!")
