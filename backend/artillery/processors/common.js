function pickRandomInStockProductId(products, minStock = 1) {
  if (!Array.isArray(products) || products.length === 0) return null;
  const min = Number(minStock);
  const inStock = products.filter((p) => {
    const stock = Number(p?.stock);
    return Number.isFinite(stock) && stock >= min;
  });
  const list = inStock.length ? inStock : products;
  const idx = randomInt(0, Math.max(0, list.length - 1));
  const chosen = list[idx];
  const id = chosen && (chosen.id ?? chosen.product_id ?? chosen.productId);
  return id != null ? String(id) : null;
}

function randomInt(min, max) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function normalizeJsonBody(response) {
  const body = response && response.body;
  if (body == null) return null;
  if (typeof body === 'object') return body;
  if (typeof body !== 'string') return null;

  const text = body.trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

module.exports = {
  setUserIdFromLogin: (requestParams, response, context, ee, next) => {
    context.vars = context.vars || {};
    try {
      const body = normalizeJsonBody(response) || response?.body;
      const user = body?.user;
      const userId = user?.id;
      if (userId != null) {
        context.vars.loginUserId = String(userId);
        context.vars.userId = String(userId);
        return next();
      }

      const errorMsg = body?.error;
      const email = context.vars.email ? String(context.vars.email) : '(unknown email)';

      const status = response?.statusCode != null ? ` status=${response.statusCode}` : '';
      return next(new Error(`Login failed for ${email}.${status} API error: ${errorMsg || 'unknown'}`));
    } catch (e) {
      return next(new Error(`Login response could not be parsed: ${e?.message || e}`));
    }
  },

  setCartId: (requestParams, response, context, ee, next) => {
    context.vars = context.vars || {};
    try {
      const body = normalizeJsonBody(response) || response?.body;
      const cartId = body?.id;
      if (cartId != null) context.vars.cartId = String(cartId);
    } catch {
      // ignore
    }
    if (!context.vars.cartId) {
      return next(new Error('No cartId returned from /api/cart/user/:userId'));
    }
    return next();
  },

  setProductIdFromProducts: (requestParams, response, context, ee, next) => {
    context.vars = context.vars || {};
    try {
      const body = normalizeJsonBody(response) || response?.body;
      const productId = pickRandomInStockProductId(body, 1);
      if (productId) context.vars.productId = productId;
    } catch {
      // ignore
    }
    if (!context.vars.productId) {
      return next(new Error('No productId found from /api/products response'));
    }
    return next();
  },

  markAddItemResult: (requestParams, response, context, ee, next) => {
    context.vars = context.vars || {};
    const status = Number(response?.statusCode);
    const ok = status >= 200 && status < 300;
    context.vars.addItemOk = ok;
    return next();
  },

  // Used by Artillery as an HTTP-step `ifTrue` predicate: cond(vars) -> boolean
  shouldCheckout: (vars) => {
    return Boolean(vars && vars.addItemOk);
  },

  // Used as an Artillery "function" step (different signature than afterResponse)
  setQuantityStep: (context, ee, next) => {
    context.vars = context.vars || {};
    // Keep quantity low so we don't drain inventory instantly.
    context.vars.quantity = String(randomInt(1, 1));
    return next();
  },
};
