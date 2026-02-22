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
                localStorage.removeItem('userProfile');
                window.location.href = 'login.html';
            }
        });
    }

    async loadUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select(`
                    *,
                    profiles:user_profiles(*)
                `)
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

    async register(userData) {
        try {
            const { email, password, role, full_name, phone } = userData;
            
            // Register with Supabase Auth
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        role: role,
                        full_name: full_name
                    }
                }
            });

            if (authError) throw authError;

            // Create user record in users table
            const { data: userRecord, error: userError } = await this.supabase
                .from('users')
                .insert({
                    email: email,
                    role: role,
                    is_active: true,
                    email_verified: false
                })
                .select()
                .single();

            if (userError) throw userError;

            // Create user profile
            const { data: profileData, error: profileError } = await this.supabase
                .from('user_profiles')
                .insert({
                    user_id: userRecord.id,
                    full_name: full_name,
                    phone: phone
                })
                .select()
                .single();

            if (profileError) throw profileError;

            console.log('Registration successful:', { userRecord, profileData });

            return {
                success: true,
                user: userRecord,
                profile: profileData
            };

        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message || 'Registrasi gagal'
            };
        }
    }

    async login(email, password) {
        try {
            console.log('Login attempt for:', email);
            
            // Try Supabase Auth first
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) {
                console.log('Supabase Auth failed:', authError.message);
                throw authError;
            }

            if (authData.user) {
                console.log('Login successful:', authData.user);
                await this.loadUserProfile(authData.user.id);
                
                // Redirect based on role
                const user = this.currentUser.profile;
                if (user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else if (user.role === 'seller') {
                    window.location.href = 'seller-dashboard.html';
                } else {
                    window.location.href = 'buyer-dashboard.html';
                }
                
                return {
                    success: true,
                    user: authData.user,
                    profile: this.currentUser.profile
                };
            }

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Login gagal. Periksa email dan password Anda.'
            };
        }
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            localStorage.removeItem('userProfile');
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if error
            window.location.href = 'login.html';
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserRole() {
        return this.currentUser?.profile?.role || null;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.getUserRole() === role;
    }

    // Protect page - redirect if not authenticated or wrong role
    protectPage(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }

        if (requiredRole && !this.hasRole(requiredRole)) {
            // Redirect to appropriate dashboard based on current role
            const currentRole = this.getUserRole();
            if (currentRole === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else if (currentRole === 'seller') {
                window.location.href = 'seller-dashboard.html';
            } else {
                window.location.href = 'buyer-dashboard.html';
            }
            return false;
        }

        return true;
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.supabase
                .from('user_profiles')
                .update(profileData)
                .eq('user_id', this.currentUser.id)
                .select()
                .single();

            if (error) throw error;

            // Update cached profile
            this.currentUser.profile = { ...this.currentUser.profile, ...data };
            localStorage.setItem('userProfile', JSON.stringify(this.currentUser.profile));

            return {
                success: true,
                data: data
            };

        } catch (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                error: error.message || 'Gagal memperbarui profil'
            };
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;

            return {
                success: true,
                message: 'Email reset password telah dikirim'
            };

        } catch (error) {
            console.error('Reset password error:', error);
            return {
                success: false,
                error: error.message || 'Gagal mengirim email reset password'
            };
        }
    }

    // Update password
    async updatePassword(newPassword) {
        try {
            const { data, error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            return {
                success: true,
                message: 'Password berhasil diperbarui'
            };

        } catch (error) {
            console.error('Update password error:', error);
            return {
                success: false,
                error: error.message || 'Gagal memperbarui password'
            };
        }
    }
}

// Initialize auth service when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.authService = new AuthService();
});
