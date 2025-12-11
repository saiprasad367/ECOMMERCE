const supabase = require("../config/supabase");

// Helper: get or create a cart (for user or guest)
async function getOrCreateCart(userId) {
  let query = supabase.from("carts").select("*");
  if (userId) query = query.eq("user_id", userId);
  else query = query.is("user_id", null);

  let { data: cart } = await query.single();

  if (!cart) {
    const { data: newCart } = await supabase
      .from("carts")
      .insert([{ user_id: userId || null }])
      .select()
      .single();
    return newCart;
  }

  return cart;
}

// GET /api/cart
exports.getCart = async (req, res) => {
  const userId = req.user?.id || null;
  const cart = await getOrCreateCart(userId);

  const { data: items } = await supabase
    .from("cart_items")
    .select("id, quantity, product:products(*)")
    .eq("cart_id", cart.id);

  res.json({ cart_id: cart.id, items });
};

// POST /api/cart/items
exports.addItem = async (req, res) => {
  const userId = req.user?.id || null;
  const { product_id, quantity } = req.body;

  const cart = await getOrCreateCart(userId);

  // Check if item exists
  const { data: exists } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cart.id)
    .eq("product_id", product_id)
    .single();

  if (exists) {
    const { data } = await supabase
      .from("cart_items")
      .update({ quantity: exists.quantity + (quantity || 1) })
      .eq("id", exists.id)
      .select();

    return res.json({ message: "Quantity increased", item: data });
  }

  const { data } = await supabase
    .from("cart_items")
    .insert([{ cart_id: cart.id, product_id, quantity: quantity || 1 }])
    .select();

  res.json({ message: "Item added to cart", item: data });
};

// PUT /api/cart/items/:itemId
exports.updateItem = async (req, res) => {
  const itemId = req.params.itemId;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  const { data } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId)
    .select();

  res.json({ message: "Quantity updated", item: data });
};

// DELETE /api/cart/items/:itemId
exports.removeItem = async (req, res) => {
  const itemId = req.params.itemId;

  await supabase.from("cart_items").delete().eq("id", itemId);

  res.json({ message: "Item removed from cart" });
};
