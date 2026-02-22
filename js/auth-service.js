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
            // First, get user from database to check role
            const { data: user, error: userError } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (userError || !user) {
                throw new Error('User not found');
            }

            // For demo purposes, we'll use simple password check
            // In production, use Supabase Auth properly
            if (password === 'admin123' && user.role === 'admin') {
                // Simulate admin login
                const mockSession = {
                    user: {
                        id: user.id,
                        email: user.email
                    }
                };
                
                this.currentUser = mockSession.user;
                this.currentUser.profile = user;
                localStorage.setItem('userProfile', JSON.stringify(user));
                
                // Redirect based on role
                this.redirectBasedOnRole(user.role);
                return { success: true, user };
            } else if (password === 'seller123' && user.role === 'penjual') {
                // Simulate seller login
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
            } else if (password === 'buyer123' && user.role === 'pembeli') {
                // Simulate buyer login
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
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async register(userData) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .insert([{
                    email: userData.email,
                    password_hash: 'hashed_password', // In production, hash this properly
                    full_name: userData.fullName,
                    role: userData.role || 'pembeli',
                    phone: userData.phone
                }])
                .select()
                .single();

            if (error) throw error;

            return { success: true, user: data };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
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
