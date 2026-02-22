// Seller Verification Manager
class SellerVerificationManager {
    constructor() {
        this.currentStep = 1;
        this.formData = {
            ktpName: '',
            ktpNumber: '',
            ktpPhoto: null,
            selfieKtp: null,
            whatsappNumber: '',
            storeName: '',
            storeDescription: '',
            storeCategory: '',
            storeCity: '',
            storeLogo: null,
            paymentType: '',
            bankName: '',
            bankAccountNumber: '',
            bankAccountName: '',
            ewalletType: '',
            ewalletNumber: '',
            ewalletAccountName: '',
            termsAccepted: false,
            sellerPolicyAccepted: false,
            legalProductsAccepted: false,
            responseCommitmentAccepted: false,
            noFakeProductsAccepted: false
        };
        this.init();
    }

    init() {
        console.log('Seller verification page loaded');
        this.checkUserAuthentication();
        this.setupEventListeners();
        this.checkExistingApplication();
    }

    checkUserAuthentication() {
        if (!window.authService || !window.authService.isAuthenticated()) {
            alert('Anda harus login terlebih dahulu!');
            window.location.href = 'login.html';
            return;
        }

        const user = window.authService.getCurrentUser();
        if (user.role !== 'seller') {
            alert('Halaman ini hanya untuk seller!');
            window.location.href = 'index.html';
            return;
        }

        this.currentUser = user;
        console.log('Current user:', user);
    }

    checkExistingApplication() {
        // Check if user already has an application
        this.loadExistingApplication();
    }

    async loadExistingApplication() {
        try {
            const { data, error } = await window.SupabaseClient
                .from('seller_applications')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (data) {
                console.log('Existing application found:', data);
                this.populateForm(data);
                this.updateStatusBadge(data.status);
                
                if (data.status === 'verified') {
                    this.showVerifiedState();
                } else if (data.status === 'pending') {
                    this.showPendingState();
                } else if (data.status === 'rejected') {
                    this.showRejectedState(data.rejection_reason);
                }
            }
        } catch (error) {
            console.log('No existing application found');
        }
    }

    populateForm(data) {
        // Populate all form fields with existing data
        Object.keys(this.formData).forEach(key => {
            if (data[key] !== undefined) {
                this.formData[key] = data[key];
                
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = data[key];
                    } else {
                        element.value = data[key];
                    }
                }
            }
        });

        // Show file previews if available
        if (data.ktp_photo_url) {
            this.showFilePreview('ktpPreview', data.ktp_photo_url);
        }
        if (data.selfie_ktp_url) {
            this.showFilePreview('selfiePreview', data.selfie_ktp_url);
        }
        if (data.store_logo_url) {
            this.showFilePreview('logoPreview', data.store_logo_url);
        }

        // Show payment fields based on payment type
        if (data.payment_type) {
            document.getElementById('paymentType').value = data.payment_type;
            this.togglePaymentFields();
        }
    }

    updateStatusBadge(status) {
        const badge = document.getElementById('statusBadge');
        badge.className = 'status-badge';
        
        switch (status) {
            case 'pending':
                badge.classList.add('status-pending');
                badge.innerHTML = '⏳ Pending Review';
                break;
            case 'verified':
                badge.classList.add('status-verified');
                badge.innerHTML = '✅ Terverifikasi';
                break;
            case 'rejected':
                badge.classList.add('status-rejected');
                badge.innerHTML = '❌ Ditolak';
                break;
        }
    }

    showVerifiedState() {
        // Disable all form inputs
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = true;
        });
        
        // Hide submit button
        document.getElementById('submitBtn').style.display = 'none';
        
        // Show success message
        const submitSection = document.querySelector('.submit-section');
        submitSection.innerHTML = `
            <div class="alert alert-success">
                <h3>🎉 Selamat! Akun Anda Terverifikasi</h3>
                <p>Toko Anda sudah aktif dan siap berjualan.</p>
                <a href="seller-dashboard.html" class="btn btn-primary">
                    <i class="fas fa-tachometer-alt"></i>
                    Ke Dashboard Seller
                </a>
            </div>
        `;
    }

    showPendingState() {
        // Disable all form inputs
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = true;
        });
        
        // Hide submit button
        document.getElementById('submitBtn').style.display = 'none';
        
        // Show pending message
        const submitSection = document.querySelector('.submit-section');
        submitSection.innerHTML = `
            <div class="alert alert-info">
                <h3>⏳ Sedang dalam Review</h3>
                <p>Data Anda sedang direview oleh admin. Proses ini memakan waktu 1-3 hari kerja.</p>
                <p>Anda akan menerima email notifikasi setelah proses selesai.</p>
                <button onclick="location.reload()" class="btn btn-secondary">
                    <i class="fas fa-sync"></i>
                    Refresh Status
                </button>
            </div>
        `;
    }

    showRejectedState(reason) {
        // Enable form inputs for editing
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = false;
        });
        
        // Show rejection reason
        const submitSection = document.querySelector('.submit-section');
        submitSection.innerHTML = `
            <div class="alert alert-danger">
                <h3>❌ Verifikasi Ditolak</h3>
                <p>Alasan: ${reason || 'Data yang Anda masukkan tidak valid'}</p>
                <p>Silakan perbaiki data dan ajukan kembali.</p>
            </div>
        `;
        
        // Re-add submit button
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'btn btn-primary btn-large';
        submitBtn.id = 'submitBtn';
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Ajukan Ulang Verifikasi';
        submitSection.appendChild(submitBtn);
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('verificationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.submitVerification(e));
        }

        // Store name availability check
        const storeNameInput = document.getElementById('storeName');
        if (storeNameInput) {
            storeNameInput.addEventListener('blur', () => this.checkStoreNameAvailability());
        }

        // Payment type change
        const paymentTypeSelect = document.getElementById('paymentType');
        if (paymentTypeSelect) {
            paymentTypeSelect.addEventListener('change', () => this.togglePaymentFields());
        }
    }

    async checkStoreNameAvailability() {
        const storeName = document.getElementById('storeName').value.trim();
        if (!storeName) return;

        try {
            const { data, error } = await window.SupabaseClient
                .from('seller_applications')
                .select('store_name')
                .eq('store_name', storeName)
                .neq('user_id', this.currentUser.id)
                .single();

            if (data) {
                this.showFieldError('storeName', 'Nama toko sudah digunakan!');
            } else {
                this.clearFieldError('storeName');
            }
        } catch (error) {
            // Name is available
            this.clearFieldError('storeName');
        }
    }

    togglePaymentFields() {
        const paymentType = document.getElementById('paymentType').value;
        const bankFields = document.getElementById('bankFields');
        const ewalletFields = document.getElementById('ewalletFields');

        if (paymentType === 'bank') {
            bankFields.style.display = 'block';
            ewalletFields.style.display = 'none';
        } else if (paymentType === 'ewallet') {
            bankFields.style.display = 'none';
            ewalletFields.style.display = 'block';
        } else {
            bankFields.style.display = 'none';
            ewalletFields.style.display = 'none';
        }
    }

    async submitVerification(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        submitBtn.disabled = true;

        try {
            // Collect form data
            this.collectFormData();
            
            // Upload files and get URLs
            await this.uploadFiles();
            
            // Save to database
            await this.saveApplication();
            
            // Show success
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('Verification submission error:', error);
            this.showErrorMessage('Gagal mengirim data. Silakan coba lagi.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        let isValid = true;
        
        // Validate required fields
        const requiredFields = [
            'ktpName', 'ktpNumber', 'whatsappNumber', 'storeName', 
            'storeCategory', 'storeCity', 'paymentType'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                this.showFieldError(fieldId, 'Field ini wajib diisi!');
                isValid = false;
            } else {
                this.clearFieldError(fieldId);
            }
        });

        // Validate file uploads
        if (!this.formData.ktpPhoto && !document.getElementById('ktpPhoto').files[0]) {
            this.showFieldError('ktpPhoto', 'Foto KTP wajib diupload!');
            isValid = false;
        }

        if (!this.formData.selfieKtp && !document.getElementById('selfieKtp').files[0]) {
            this.showFieldError('selfieKtp', 'Foto selfie wajib diupload!');
            isValid = false;
        }

        // Validate payment fields
        const paymentType = document.getElementById('paymentType').value;
        if (paymentType === 'bank') {
            const bankFields = ['bankName', 'bankAccountNumber', 'bankAccountName'];
            bankFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value.trim()) {
                    this.showFieldError(fieldId, 'Field ini wajib diisi!');
                    isValid = false;
                }
            });
        } else if (paymentType === 'ewallet') {
            const ewalletFields = ['ewalletType', 'ewalletNumber', 'ewalletAccountName'];
            ewalletFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value.trim()) {
                    this.showFieldError(fieldId, 'Field ini wajib diisi!');
                    isValid = false;
                }
            });
        }

        // Validate checkboxes
        const checkboxes = [
            'termsAccepted', 'sellerPolicyAccepted', 'legalProductsAccepted',
            'responseCommitmentAccepted', 'noFakeProductsAccepted'
        ];
        
        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (!checkbox.checked) {
                this.showFieldError(checkboxId, 'Anda harus menyetujui ini!');
                isValid = false;
            }
        });

        return isValid;
    }

    collectFormData() {
        // Collect all form data
        Object.keys(this.formData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    this.formData[key] = element.checked;
                } else {
                    this.formData[key] = element.value;
                }
            }
        });
    }

    async uploadFiles() {
        const files = {
            ktpPhoto: document.getElementById('ktpPhoto').files[0],
            selfieKtp: document.getElementById('selfieKtp').files[0],
            storeLogo: document.getElementById('storeLogo').files[0]
        };

        for (const [key, file] of Object.entries(files)) {
            if (file) {
                const fileName = `${this.currentUser.id}_${key}_${Date.now()}`;
                const filePath = `seller-verification/${fileName}`;
                
                const { data, error } = await window.SupabaseClient.storage
                    .from('documents')
                    .upload(filePath, file);

                if (error) throw error;

                // Get public URL
                const { data: { publicUrl } } = window.SupabaseClient.storage
                    .from('documents')
                    .getPublicUrl(filePath);

                // Map to database field names
                if (key === 'ktpPhoto') this.formData.ktp_photo_url = publicUrl;
                if (key === 'selfieKtp') this.formData.selfie_ktp_url = publicUrl;
                if (key === 'storeLogo') this.formData.store_logo_url = publicUrl;
            }
        }
    }

    async saveApplication() {
        const applicationData = {
            user_id: this.currentUser.id,
            ktp_name: this.formData.ktpName,
            ktp_number: this.formData.ktpNumber,
            ktp_photo_url: this.formData.ktp_photo_url,
            selfie_ktp_url: this.formData.selfie_ktp_url,
            whatsapp_number: this.formData.whatsappNumber,
            store_name: this.formData.storeName,
            store_description: this.formData.storeDescription,
            store_category: this.formData.storeCategory,
            store_city: this.formData.storeCity,
            store_logo_url: this.formData.store_logo_url,
            payment_type: this.formData.paymentType,
            bank_name: this.formData.bankName,
            bank_account_number: this.formData.bankAccountNumber,
            bank_account_name: this.formData.bankAccountName,
            ewallet_type: this.formData.ewalletType,
            ewallet_number: this.formData.ewalletNumber,
            ewallet_account_name: this.formData.ewalletAccountName,
            terms_accepted: this.formData.termsAccepted,
            seller_policy_accepted: this.formData.sellerPolicyAccepted,
            legal_products_accepted: this.formData.legalProductsAccepted,
            response_commitment_accepted: this.formData.responseCommitmentAccepted,
            no_fake_products_accepted: this.formData.noFakeProductsAccepted,
            status: 'pending'
        };

        const { data, error } = await window.SupabaseClient
            .from('seller_applications')
            .upsert(applicationData, { onConflict: 'user_id' })
            .select();

        if (error) throw error;
        
        console.log('Application saved:', data);
        return data;
    }

    showSuccessMessage() {
        const submitSection = document.querySelector('.submit-section');
        submitSection.innerHTML = `
            <div class="alert alert-success">
                <h3>✅ Data Berhasil Dikirim!</h3>
                <p>Data verifikasi Anda telah diterima dan akan direview oleh admin.</p>
                <p>Proses review memakan waktu 1-3 hari kerja.</p>
                <p>Anda akan menerima email notifikasi setelah proses selesai.</p>
                <a href="seller-dashboard.html" class="btn btn-primary mt-2">
                    <i class="fas fa-tachometer-alt"></i>
                    Ke Dashboard Seller
                </a>
            </div>
        `;
        
        // Update status badge
        this.updateStatusBadge('pending');
    }

    showErrorMessage(message) {
        const submitSection = document.querySelector('.submit-section');
        submitSection.innerHTML = `
            <div class="alert alert-danger">
                <h3>❌ Terjadi Kesalahan</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-secondary mt-2">
                    <i class="fas fa-redo"></i>
                    Coba Lagi
                </button>
            </div>
        `;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove existing error
        this.clearFieldError(fieldId);

        // Add error styling
        field.classList.add('error');

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.id = `${fieldId}_error`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('error');

        const errorDiv = document.getElementById(`${fieldId}_error`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showFilePreview(previewId, url) {
        const preview = document.getElementById(previewId);
        if (!preview) return;

        preview.innerHTML = `<img src="${url}" alt="Preview" style="max-width: 100%; height: auto;">`;
        preview.style.display = 'block';
    }
}

// Global functions for HTML onclick handlers
window.previewFile = function(event, previewId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; height: auto;">`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
};

window.togglePaymentFields = function() {
    const manager = window.sellerVerificationManager;
    if (manager) {
        manager.togglePaymentFields();
    }
};

window.submitVerification = function(event) {
    const manager = window.sellerVerificationManager;
    if (manager) {
        manager.submitVerification(event);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.sellerVerificationManager = new SellerVerificationManager();
});
