const Favorite = require('../models/Favorite');

exports.getMyFavoriteIds = async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    const ids = await Favorite.getFavoriteProductIdsByUserId(user_id);
    return res.json({ ids });
};

exports.getMyFavorites = async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    const products = await Favorite.getFavoriteProductsByUserId(user_id);
    return res.json(products);
};

exports.toggleFavorite = async (req, res) => {
    const user_id = req.user?.id;
    const product_id = Number(req.body?.product_id);

    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });
    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    const exists = await Favorite.isFavorite(user_id, product_id);

    if (exists) {
        await Favorite.removeFavorite(user_id, product_id);
        return res.json({ product_id, is_favorite: false });
    }

    await Favorite.addFavorite(user_id, product_id);
    return res.json({ product_id, is_favorite: true });
};

exports.addFavorite = async (req, res) => {
    const user_id = req.user?.id;
    const product_id = Number(req.body?.product_id);

    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });
    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    await Favorite.addFavorite(user_id, product_id);
    return res.status(201).json({ product_id, is_favorite: true });
};

exports.removeFavorite = async (req, res) => {
    const user_id = req.user?.id;
    const product_id = Number(req.params?.productId);

    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });
    if (!product_id) return res.status(400).json({ error: 'productId is required' });

    await Favorite.removeFavorite(user_id, product_id);
    return res.json({ product_id, is_favorite: false });
};
