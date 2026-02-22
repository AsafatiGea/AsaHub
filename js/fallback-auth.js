// Fallback Auth Service (localStorage mode)
class FallbackAuthService {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check existing session in localStorage
        const savedUser = localStorage.getItem('userProfile');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    async login(email, password) {
        try {
            // Cek apakah Supabase tersedia
            if (typeof window.SupabaseClient !== 'undefined') {
                // Gunakan Supabase jika tersedia
                const { data: { session }, error } = await window.SupabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) {
                    console.error('Supabase login error:', error);
                    return { success: false, error: error.message };
                }
                
                if (session) {
                    // Load user profile dari database
                    const { data: profile, error: profileError } = await window.SupabaseClient
                        .from('users')
                        .select('*')
                        .eq('email', email)
                        .single();
                    
                    if (profileError) {
                        console.error('Profile load error:', profileError);
                        return { success: false, error: 'Profile not found' };
                    }
                    
                    this.currentUser = { id: session.user.id, email: session.user.email };
                    this.currentUser.profile = profile;
                    localStorage.setItem('userProfile', JSON.stringify(profile));
                    
                    this.redirectBasedOnRole(profile.role);
                    return { success: true, user: this.currentUser };
                } else {
                    return { success: false, error: 'Login failed' };
                }
            } else {
                // Gunakan fallback mode (localStorage) jika Supabase tidak tersedia
                console.log('Using fallback auth mode (localStorage)');
                
                const demoUsers = [
                    { 
                        id: 'admin-001', 
                        email: 'admin@asahub.site', 
                        password: 'admin123_hash', 
                        role: 'admin', 
                        full_name: 'Admin AsaHub', 
                        phone: '08123456789'
                    },
                    { 
                        id: 'seller-001', 
                        email: 'seller@asahub.site', 
                        password: 'seller123_hash', 
                        role: 'penjual', 
                        full_name: 'Seller Demo', 
                        phone: '08123456788'
                    },
                    { 
                        id: 'buyer-001', 
                        email: 'buyer@asahub.site', 
                        password: 'buyer123_hash', 
                        role: 'pembeli', 
                        full_name: 'Buyer Demo', 
                        phone: '08123456787'
                    }
                ];
                
                const user = demoUsers.find(u => u.email === email && u.password === password);
                
                if (user) {
                    this.currentUser = { id: user.id, email: user.email };
                    this.currentUser.profile = user;
                    localStorage.setItem('userProfile', JSON.stringify(user));
                    
                    this.redirectBasedOnRole(user.role);
                    return { success: true, user };
                } else {
                    return { success: false, error: 'Invalid credentials' };
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
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

    logout() {
        localStorage.removeItem('userProfile');
        this.currentUser = null;
        window.location.href = 'login.html';
    }
}

// Use fallback if Supabase is not available
window.authService = new FallbackAuthService();
console.log('Using fallback auth service (localStorage mode)');
