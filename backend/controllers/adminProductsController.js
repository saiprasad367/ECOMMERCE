const supabase = require("../config/supabase");

// ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, stock } = req.body;

    if (!title || !description || !price || !stock)
      return res.status(400).json({ message: "All fields required" });

    // Insert product first
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([{ title, description, price, stock }])
      .select()
      .single();

    if (productError) throw productError;

    const productId = product.id;
    const images = [];

    // Upload images to Supabase Storage
    for (const file of req.files) {
      const ext = file.originalname.split(".").pop();
      const fileName = `product-${Date.now()}-${Math.random()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage
        .from("products")
        .getPublicUrl(fileName).data.publicUrl;

      images.push(publicUrl);

      // store image in product_images table
      await supabase.from("product_images").insert([
        { product_id: productId, image_url: publicUrl },
      ]);
    }

    res.status(201).json({
      message: "Product added successfully",
      product,
      images,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, description, price, stock } = req.body;

    const { error } = await supabase
      .from("products")
      .update({ title, description, price, stock })
      .eq("id", productId);

    if (error) throw error;

    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
