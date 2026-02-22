// Authentication Service untuk Supabase
class AuthService {
    constructor() {
        this.supabase = window.SupabaseClient;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check existing session
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.loadUserProfile(session.user.id);
        }

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                this.loadUserProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                window.location.href = 'login.html';
            }
        });
    }

    async loadUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            
            this.currentUser.profile = data;
            localStorage.setItem('userProfile', JSON.stringify(data));
            
            return data;
        } catch (error) {
            console.error('Error loading user profile:', error);
            return null;
        }
    }

    async login(email, password) {
        try {
            // Use Supabase Auth first
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) {
                // If Supabase Auth fails, try direct database check for demo users
                console.log('Supabase auth failed, checking database users:', authError.message);
                
                try {
                    const { data: user, error: userError } = await this.supabase
                        .from('users')
                        .select('*')
                        .eq('email', email)
                        .single();

                    if (userError || !user) {
                        throw new Error('User not found');
                    }

                    return this.handlePasswordCheck(user, password);
                } catch (dbError) {
                    throw new Error('Invalid credentials');
                }
            }

            // If Supabase Auth succeeds, load user profile
            if (authData.user) {
                try {
                    const { data: profile, error: profileError } = await this.supabase
                        .from('users')
                        .select('*')
                        .eq('id', authData.user.id)
                        .single();

                    if (profileError) {
                        console.warn('Profile not found, using auth data only');
                        this.currentUser = authData.user;
                    } else {
                        this.currentUser = authData.user;
                        this.currentUser.profile = profile;
                        localStorage.setItem('userProfile', JSON.stringify(profile));
                    }
                } catch (profileError) {
                    console.warn('Profile load failed, using auth data only');
                    this.currentUser = authData.user;
                }

                this.redirectBasedOnRole(this.currentUser.profile?.role || 'pembeli');
                return { success: true, user: this.currentUser };
            }

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    handlePasswordCheck(user, password) {
        // Demo password check for existing database users
        if ((password === 'admin123' && user.role === 'admin') ||
            (password === 'seller123' && user.role === 'penjual') ||
            (password === 'buyer123' && user.role === 'pembeli') ||
            (user.password_hash === password + '_hash')) {
            
            const mockSession = {
                user: {
                    id: user.id,
                    email: user.email
                }
            };
            
            this.currentUser = mockSession.user;
            this.currentUser.profile = user;
            localStorage.setItem('userProfile', JSON.stringify(user));
            
            this.redirectBasedOnRole(user.role);
            return { success: true, user };
        } else {
            return { success: false, error: 'Invalid credentials' };
        }
    }

    handlePasswordCheck(user, password) {
        // Demo password check
        if ((password === 'admin123' && user.role === 'admin') ||
            (password === 'seller123' && user.role === 'penjual') ||
            (password === 'buyer123' && user.role === 'pembeli')) {
            
            const mockSession = {
                user: {
                    id: user.id,
                    email: user.email
                }
            };
            
            this.currentUser = mockSession.user;
            this.currentUser.profile = user;
            localStorage.setItem('userProfile', JSON.stringify(user));
            
            this.redirectBasedOnRole(user.role);
            return { success: true, user };
        } else {
            return { success: false, error: 'Invalid credentials' };
        }
    }

    async register(userData) {
        try {
            // Check if email already exists
            const { data: existingUser, error: checkError } = await this.supabase
                .from('users')
                .select('email')
                .eq('email', userData.email)
                .single();

            if (existingUser) {
                return { success: false, error: 'Email sudah terdaftar.' };
            }

            // Insert new user into Supabase database
            const { data, error } = await this.supabase
                .from('users')
                .insert([{
                    email: userData.email,
                    password_hash: userData.password + '_hash', // Simple hash for demo
                    full_name: userData.fullName,
                    role: userData.role || 'pembeli',
                    phone: userData.phone,
                    is_active: true,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('Database insert error:', error);
                throw error;
            }

            return { success: true, user: data };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registrasi gagal. Silakan coba lagi.' };
        }
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            localStorage.removeItem('userProfile');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    redirectBasedOnRole(role) {
        const redirects = {
            'admin': 'admin-dashboard.html',
            'penjual': 'seller-dashboard.html',
            'pembeli': 'buyer-dashboard.html'
        };
        
        const redirectUrl = redirects[role] || 'index.html';
        window.location.href = redirectUrl;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    hasRole(role) {
        return this.currentUser?.profile?.role === role;
    }
}

// Initialize auth service
window.authService = new AuthService();
