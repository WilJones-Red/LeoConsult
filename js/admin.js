// Admin Panel JavaScript for Leo Chatbot

const SUPABASE_URL = 'https://clpcskkoguomoihnisai.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjYyMTIsImV4cCI6MjA3MDgwMjIxMn0.TpZQuKm0cVvl7lJbXt2Iw1_s3HlLLIIbRr7lIOyVsBo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentEditId = null;

// Check if user has admin access based on their rank metadata
function isAuthorizedAdmin(user) {
    console.log('isAuthorizedAdmin: Checking user:', user.email);
    console.log('isAuthorizedAdmin: User metadata:', user.user_metadata);
    
    const rank = user.user_metadata?.rank;
    console.log('isAuthorizedAdmin: Rank:', rank);
    
    // Allow super_admin and admin ranks
    const authorized = rank === 'super_admin' || rank === 'admin';
    console.log('isAuthorizedAdmin: Result:', authorized);
    
    return authorized;
}

// Authentication
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('auth-error');
    
    console.log('Login attempt started for:', email);
    
    if (!email || !password) {
        errorEl.textContent = 'Please enter both email and password';
        return;
    }

    try {
        console.log('Attempting Supabase authentication...');
        console.log('Supabase URL:', SUPABASE_URL);
        console.log('Supabase client initialized:', !!supabaseClient);
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        console.log('Auth response received');
        console.log('Data:', data);
        console.log('Error:', error);
        
        if (error) {
            console.error('Supabase auth error:', error);
            errorEl.textContent = error.message;
            return;
        }

        console.log('Authentication successful, checking authorization...');
        console.log('User:', data.user);
        
        // Check if user is authorized admin based on rank
        if (!isAuthorizedAdmin(data.user)) {
            console.warn('Unauthorized access attempt by:', data.user.email);
            errorEl.textContent = 'Access denied. You do not have admin privileges.';
            
            // Sign out the unauthorized user
            await supabaseClient.auth.signOut();
            
            // Show access denied screen
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('access-denied').style.display = 'block';
            return;
        }
        
        console.log('User authorized, showing admin panel');
        showAdminPanel();
        loadAllData();
    } catch (err) {
        errorEl.textContent = 'Login failed. Please try again.';
        console.error('Login error:', err);
    }
}

function returnToLogin() {
    document.getElementById('access-denied').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('auth-error').textContent = '';
}

async function logout() {
    await supabaseClient.auth.signOut();
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('access-denied').style.display = 'none';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('auth-error').textContent = '';
}

function showAdminPanel() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('access-denied').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
}

// Check if user is already logged in and authorized
console.log('Checking for existing session...');
supabaseClient.auth.getSession().then(({ data: { session } }) => {
    console.log('Session check result:', session);
    if (session) {
        console.log('Session found, checking authorization for:', session.user.email);
        if (isAuthorizedAdmin(session.user)) {
            console.log('User is authorized, showing admin panel');
            showAdminPanel();
            loadAllData();
        } else {
            console.warn('Unauthorized session detected for:', session.user.email);
            supabaseClient.auth.signOut();
            document.getElementById('access-denied').style.display = 'block';
            document.getElementById('auth-container').style.display = 'none';
        }
    } else {
        console.log('No existing session found');
    }
}).catch(err => {
    console.error('Error getting session:', err);
});

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        if (isAuthorizedAdmin(session.user)) {
            showAdminPanel();
            loadAllData();
        } else {
            console.warn('Unauthorized access attempt:', session.user.email);
            supabaseClient.auth.signOut();
        }
    } else {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('admin-container').style.display = 'none';
        document.getElementById('access-denied').style.display = 'none';
    }
});

// Tab Management
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    
    // Load data for the tab
    if (tabName === 'logs') loadChatLogs();
    if (tabName === 'low-conf') loadLowConfidence();
    if (tabName === 'users') loadUsers();
}

// Load Analytics
async function loadAnalytics() {
    const { data, error } = await supabaseClient.from('chat_analytics')
        .select('*')
        .single();
    
    if (!error && data) {
        document.getElementById('stat-total').textContent = data.total_queries || 0;
        document.getElementById('stat-confidence').textContent = 
            ((data.avg_confidence || 0) * 100).toFixed(0) + '%';
        document.getElementById('stat-positive').textContent = data.positive_feedback || 0;
        document.getElementById('stat-low-conf').textContent = data.low_confidence_count || 0;
    }
}

// Load FAQs
async function loadFAQs() {
    const { data, error } = await supabaseClient.from('faq_chatbot')
        .select('*')
        .order('id');
    
    if (error) {
        console.error('Error loading FAQs:', error);
        return;
    }
    
    const tbody = document.getElementById('faq-list');
    tbody.innerHTML = '';
    
    data.forEach(faq => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${faq.question}</td>
            <td>${faq.answer.substring(0, 100)}${faq.answer.length > 100 ? '...' : ''}</td>
            <td>${faq.intent || 'general'}</td>
            <td>
                <button class="btn btn-primary" onclick="editFAQ(${faq.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteFAQ(${faq.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load Chat Logs
async function loadChatLogs() {
    const { data, error } = await supabaseClient.from('chat_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
    
    if (error) {
        console.error('Error loading logs:', error);
        return;
    }
    
    const tbody = document.getElementById('logs-list');
    tbody.innerHTML = '';
    
    data.forEach(log => {
        const row = document.createElement('tr');
        const confidenceClass = 
            log.confidence_score >= 0.7 ? 'confidence-high' :
            log.confidence_score >= 0.5 ? 'confidence-medium' : 'confidence-low';
        
        row.innerHTML = `
            <td>${log.user_query}</td>
            <td>${log.bot_response.substring(0, 80)}...</td>
            <td class="${confidenceClass}">${(log.confidence_score * 100).toFixed(0)}%</td>
            <td>${new Date(log.created_at).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// Load Low Confidence Queries
async function loadLowConfidence() {
    const { data, error } = await supabaseClient.from('low_confidence_queries')
        .select('*')
        .limit(50);
    
    if (error) {
        console.error('Error loading low confidence queries:', error);
        return;
    }
    
    const tbody = document.getElementById('low-conf-list');
    tbody.innerHTML = '';
    
    data.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.user_query}</td>
            <td>${log.bot_response.substring(0, 60)}...</td>
            <td class="confidence-low">${(log.confidence_score * 100).toFixed(0)}%</td>
            <td>${new Date(log.created_at).toLocaleString()}</td>
            <td>
                <button class="btn btn-success" onclick="createFAQFromQuery('${log.user_query.replace(/'/g, "\\'")}')">
                    ➕ Add FAQ
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// FAQ CRUD Operations
function showAddFAQ() {
    currentEditId = null;
    document.getElementById('modal-title').textContent = 'Add New FAQ';
    document.getElementById('faq-question').value = '';
    document.getElementById('faq-answer').value = '';
    document.getElementById('faq-intent').value = '';
    document.getElementById('faq-tags').value = '';
    document.getElementById('faq-modal').classList.add('active');
}

async function editFAQ(id) {
    currentEditId = id;
    const { data, error } = await supabaseClient.from('faq_chatbot')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        alert('Error loading FAQ');
        return;
    }
    
    document.getElementById('modal-title').textContent = 'Edit FAQ';
    document.getElementById('faq-question').value = data.question;
    document.getElementById('faq-answer').value = data.answer;
    document.getElementById('faq-intent').value = data.intent || '';
    document.getElementById('faq-tags').value = data.tags || '';
    document.getElementById('faq-modal').classList.add('active');
}

async function saveFAQ() {
    const faqData = {
        question: document.getElementById('faq-question').value,
        answer: document.getElementById('faq-answer').value,
        intent: document.getElementById('faq-intent').value || null,
        tags: document.getElementById('faq-tags').value || null,
        locale: 'en',
        last_updated: new Date().toISOString()
    };
    
    let error;
    if (currentEditId) {
        ({ error } = await supabaseClient.from('faq_chatbot')
            .update(faqData)
            .eq('id', currentEditId));
    } else {
        ({ error } = await supabaseClient.from('faq_chatbot')
            .insert([faqData]));
    }
    
    if (error) {
        alert('Error saving FAQ: ' + error.message);
        return;
    }
    
    closeModal();
    loadFAQs();
    alert('FAQ saved! Remember to retrain the model to update embeddings.');
}

async function deleteFAQ(id) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    const { error } = await supabaseClient.from('faq_chatbot')
        .delete()
        .eq('id', id);
    
    if (error) {
        alert('Error deleting FAQ');
        return;
    }
    
    loadFAQs();
    alert('FAQ deleted! Remember to retrain the model.');
}

function closeModal() {
    document.getElementById('faq-modal').classList.remove('active');
}

function createFAQFromQuery(query) {
    showAddFAQ();
    document.getElementById('faq-question').value = query;
}

// Retrain Model
async function retrainModel() {
    if (!confirm('This will regenerate embeddings for all FAQs. This may take a minute. Continue?')) return;
    
    const button = event.target;
    button.disabled = true;
    button.textContent = '⏳ Retraining...';
    
    try {
        const response = await fetch('https://clpcskkoguomoihnisai.supabase.co/functions/v1/retrain-faq', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Retrain failed');
        }
        
        alert('✅ Model retrained successfully! Embeddings have been updated.');
    } catch (error) {
        alert('❌ Error retraining model: ' + error.message);
    } finally {
        button.disabled = false;
        button.textContent = '🔄 Retrain Model';
    }
}

// User Management Functions
function showAddUser() {
    document.getElementById('user-modal').style.display = 'flex';
    document.getElementById('user-email').value = '';
    document.getElementById('user-role').value = 'admin';
}

function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

async function saveUser() {
    const email = document.getElementById('user-email').value;
    const rank = document.getElementById('user-role').value;
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    try {
        // Get current session to send auth token
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
            alert('You must be logged in to add users');
            return;
        }
        
        // Call the Supabase Edge Function to update user rank
        const response = await fetch(`${SUPABASE_URL}/functions/v1/update-user-rank`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, rank })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to update user rank');
        }
        
        alert(`✅ ${result.message}`);
        closeUserModal();
        
    } catch (error) {
        if (error.message.includes('User not found')) {
            alert('❌ User not found. The user must have a Supabase account first.\n\nTo add a new admin:\n1. Have them sign up at your website\n2. Then come back here to grant them admin access');
        } else if (error.message.includes('Only super administrators')) {
            alert('❌ Only super administrators can manage user ranks');
        } else {
            alert('❌ Error: ' + error.message);
        }
    }
}

// Load all data
function loadAllData() {
    loadAnalytics();
    loadFAQs();
}

// Auto-refresh analytics every 30 seconds
setInterval(loadAnalytics, 30000);