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
            console.log('Login attempt for:', email);
            
            // First check database users (for users registered via our form)
            try {
                const { data: user, error: userError } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (!userError && user) {
                    console.log('Found user in database, checking password');
                    return this.handlePasswordCheck(user, password);
                }
            } catch (dbError) {
                console.log('Database check failed, trying Supabase Auth');
            }
            
            // Try Supabase Auth (for users created via Supabase Auth system)
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) {
                console.log('Supabase auth failed, checking localStorage:', authError.message);
                return this.handleLocalStorageLogin(email, password);
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

    handleLocalStorageLogin(email, password) {
        console.log('Checking localStorage for login');
        
        // Check hardcoded demo users first
        const demoUsers = [
            { 
                id: 'admin-001', 
                email: 'admin@asahub.site', 
                password: 'admin123', 
                role: 'admin', 
                full_name: 'Admin AsaHub', 
                phone: '08123456789'
            },
            { 
                id: 'seller-001', 
                email: 'seller@asahub.site', 
                password: 'seller123', 
                role: 'penjual', 
                full_name: 'Seller Demo', 
                phone: '08123456788'
            },
            { 
                id: 'buyer-001', 
                email: 'buyer@asahub.site', 
                password: 'buyer123', 
                role: 'pembeli', 
                full_name: 'Buyer Demo', 
                phone: '08123456787'
            }
        ];
        
        const demoUser = demoUsers.find(u => u.email === email && u.password === password);
        if (demoUser) {
            this.currentUser = { id: demoUser.id, email: demoUser.email };
            this.currentUser.profile = demoUser;
            localStorage.setItem('userProfile', JSON.stringify(demoUser));
            
            this.redirectBasedOnRole(demoUser.role);
            return { success: true, user: this.currentUser };
        }
        
        // Check localStorage registered users
        const localUsers = JSON.parse(localStorage.getItem('asahub_users') || '[]');
        const localUser = localUsers.find(u => u.email === email && u.password_hash === password + '_hash');
        
        if (localUser) {
            this.currentUser = { id: localUser.id, email: localUser.email };
            this.currentUser.profile = localUser;
            localStorage.setItem('userProfile', JSON.stringify(localUser));
            
            this.redirectBasedOnRole(localUser.role);
            return { success: true, user: this.currentUser };
        }
        
        return { success: false, error: 'Invalid credentials' };
    }

    handlePasswordCheck(user, password) {
        console.log('Checking password for user:', user.email);
        console.log('Stored password hash:', user.password_hash);
        console.log('Input password:', password);
        
        // Demo password check for existing database users
        if ((password === 'admin123' && user.role === 'admin') ||
            (password === 'seller123' && user.role === 'penjual') ||
            (password === 'buyer123' && user.role === 'pembeli') ||
            (user.password_hash === password + '_hash')) {
            
            console.log('Password match! Creating session...');
            
            const mockSession = {
                user: {
                    id: user.id,
                    email: user.email
                }
            };
            
            this.currentUser = mockSession.user;
            this.currentUser.profile = user;
            localStorage.setItem('userProfile', JSON.stringify(user));
            
            console.log('Session created, redirecting to:', user.role);
            this.redirectBasedOnRole(user.role);
            return { success: true, user };
        } else {
            console.log('Password mismatch!');
            return { success: false, error: 'Invalid credentials' };
        }
    }

    async register(userData) {
        try {
            console.log('Starting registration for:', userData.email);
            
            // Try Supabase first
            try {
                // Check if email already exists
                const { data: existingUser, error: checkError } = await this.supabase
                    .from('users')
                    .select('email')
                    .eq('email', userData.email)
                    .single();

                console.log('Email check result:', { existingUser, checkError });

                if (existingUser) {
                    return { success: false, error: 'Email sudah terdaftar.' };
                }

                // Insert new user into Supabase database
                console.log('Inserting new user...');
                const { data, error } = await this.supabase
                    .from('users')
                    .insert([{
                        email: userData.email,
                        password_hash: userData.password + '_hash',
                        full_name: userData.fullName,
                        role: userData.role || 'pembeli',
                        phone: userData.phone,
                        is_active: true,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                console.log('Insert result:', { data, error });

                if (error) {
                    throw error;
                }

                console.log('Registration successful:', data);
                return { success: true, user: data };
                
            } catch (dbError) {
                console.log('Database failed, using localStorage fallback:', dbError.message);
                return this.registerToLocalStorage(userData);
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registrasi gagal. Silakan coba lagi.' };
        }
    }

    registerToLocalStorage(userData) {
        try {
            console.log('Using localStorage registration for:', userData.email);
            
            const users = JSON.parse(localStorage.getItem('asahub_users') || '[]');
            
            // Check if email already exists
            if (users.find(u => u.email === userData.email)) {
                return { success: false, error: 'Email sudah terdaftar.' };
            }

            const newUser = {
                id: 'local_' + Date.now(),
                email: userData.email,
                password_hash: userData.password + '_hash',
                full_name: userData.fullName,
                role: userData.role || 'pembeli',
                phone: userData.phone,
                is_active: true,
                created_at: new Date().toISOString(),
                source: 'localStorage'
            };
            
            users.push(newUser);
            localStorage.setItem('asahub_users', JSON.stringify(users));

            console.log('LocalStorage registration successful:', newUser);
            return { success: true, user: newUser };
        } catch (error) {
            console.error('LocalStorage registration error:', error);
            return { success: false, error: 'Registrasi gagal. Silakan coba lagi.' };
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
