// API Service untuk Supabase
class ApiService {
    constructor() {
        this.supabase = window.SupabaseClient;
    }

    // ========== PRODUCTS API ==========
    async getProducts(filters = {}) {
        try {
            let query = this.supabase
                .from('products')
                .select(`
                    *,
                    categories(name),
                    users!products_seller_id_fkey(full_name, email)
                `)
                .eq('is_active', true);

            if (filters.category) {
                query = query.eq('category_id', filters.category);
            }
            if (filters.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }
            if (filters.seller) {
                query = query.eq('seller_id', filters.seller);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching products:', error);
            return { success: false, error: error.message };
        }
    }

    async getProductById(productId) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select(`
                    *,
                    categories(name),
                    users!products_seller_id_fkey(full_name, email)
                `)
                .eq('id', productId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching product:', error);
            return { success: false, error: error.message };
        }
    }

    async createProduct(productData) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .insert([productData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating product:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProduct(productId, updateData) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .update(updateData)
                .eq('id', productId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating product:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteProduct(productId) {
        try {
            const { error } = await this.supabase
                .from('products')
                .update({ is_active: false })
                .eq('id', productId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== CATEGORIES API ==========
    async getCategories() {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== ORDERS API ==========
    async getOrders(userId, role = 'buyer') {
        try {
            let query = this.supabase
                .from('orders')
                .select(`
                    *,
                    order_items(
                        *,
                        products(name, image_url)
                    )
                `);

            if (role === 'buyer') {
                query = query.eq('buyer_id', userId);
            } else if (role === 'admin') {
                // Admin can see all orders
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching orders:', error);
            return { success: false, error: error.message };
        }
    }

    async createOrder(orderData) {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating order:', error);
            return { success: false, error: error.message };
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== CART API ==========
    async getCart(userId) {
        try {
            const { data, error } = await this.supabase
                .from('cart')
                .select(`
                    *,
                    products(name, price, image_url, stock_quantity)
                `)
                .eq('buyer_id', userId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching cart:', error);
            return { success: false, error: error.message };
        }
    }

    async addToCart(userId, productId, quantity) {
        try {
            const { data, error } = await this.supabase
                .from('cart')
                .upsert([{
                    buyer_id: userId,
                    product_id: productId,
                    quantity
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.message };
        }
    }

    async updateCartItem(userId, productId, quantity) {
        try {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                const { error } = await this.supabase
                    .from('cart')
                    .delete()
                    .eq('buyer_id', userId)
                    .eq('product_id', productId);

                if (error) throw error;
                return { success: true };
            } else {
                // Update quantity
                const { data, error } = await this.supabase
                    .from('cart')
                    .update({ quantity })
                    .eq('buyer_id', userId)
                    .eq('product_id', productId)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            }
        } catch (error) {
            console.error('Error updating cart item:', error);
            return { success: false, error: error.message };
        }
    }

    async clearCart(userId) {
        try {
            const { error } = await this.supabase
                .from('cart')
                .delete()
                .eq('buyer_id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== USERS API ==========
    async getUsers() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('id, email, full_name, role, phone, created_at, is_active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching users:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserProfile(userId, updateData) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== ADDRESSES API ==========
    async getAddresses(userId) {
        try {
            const { data, error } = await this.supabase
                .from('addresses')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching addresses:', error);
            return { success: false, error: error.message };
        }
    }

    async createAddress(addressData) {
        try {
            const { data, error } = await this.supabase
                .from('addresses')
                .insert([addressData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating address:', error);
            return { success: false, error: error.message };
        }
    }

    async updateAddress(addressId, updateData) {
        try {
            const { data, error } = await this.supabase
                .from('addresses')
                .update(updateData)
                .eq('id', addressId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating address:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteAddress(addressId) {
        try {
            const { error } = await this.supabase
                .from('addresses')
                .delete()
                .eq('id', addressId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting address:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize API service
window.apiService = new ApiService();
