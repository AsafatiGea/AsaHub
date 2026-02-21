// Authentication System for AsaHub
class AuthManager {
    constructor() {
        this.supabase = window.SupabaseClient;
        this.currentUser = null;
        this.userProfile = null;
    }

    // Initialize auth state
    async init() {
        try {
            // Get current session
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session) {
                this.currentUser = session.user;
                await this.loadUserProfile();
            }

            // Listen for auth changes
            this.supabase.auth.onAuthStateChange(async (event, session) => {
                this.currentUser = session?.user || null;
                
                if (session?.user) {
                    await this.loadUserProfile();
                } else {
                    this.userProfile = null;
                }

                // Handle redirects based on auth state
                this.handleAuthRedirect(event);
            });

        } catch (error) {
            console.error('Auth initialization error:', error);
        }
    }

    // Load user profile from database
    async loadUserProfile() {
        if (!this.currentUser) return;

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = not found
                throw error;
            }

            this.userProfile = data;
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    // Sign up new user
    async signUp(email, password, role = 'buyer') {
        try {
            // Create auth user
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Create profile
            if (data.user) {
                const { error: profileError } = await this.supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: data.user.email,
                        role: role
                    });

                if (profileError) throw profileError;
            }

            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in user
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out user
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.userProfile = null;

            // Redirect to login
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    // Handle auth redirects
    handleAuthRedirect(event) {
        const currentPath = window.location.pathname;
        
        if (event === 'SIGNED_IN' && this.userProfile) {
            // Redirect based on role after sign in
            switch (this.userProfile.role) {
                case 'admin':
                    if (!currentPath.includes('admin.html')) {
                        window.location.href = 'admin.html';
                    }
                    break;
                case 'seller':
                    if (!currentPath.includes('seller.html')) {
                        window.location.href = 'seller.html';
                    }
                    break;
                case 'buyer':
                    if (!currentPath.includes('index.html')) {
                        window.location.href = 'index.html';
                    }
                    break;
            }
        } else if (event === 'SIGNED_OUT') {
            // Redirect to login after sign out
            if (!currentPath.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    }

    // Check if user has specific role
    hasRole(role) {
        return this.userProfile?.role === role;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get user profile
    getUserProfile() {
        return this.userProfile;
    }

    // Protect pages based on role
    protectPage(requiredRole) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }

        if (requiredRole && !this.hasRole(requiredRole)) {
            window.location.href = 'login.html';
            return false;
        }

        return true;
    }
}

// Initialize global auth manager
window.authManager = new AuthManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authManager.init();
});
