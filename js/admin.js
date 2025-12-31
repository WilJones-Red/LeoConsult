// Admin Panel JavaScript for Leo Chatbot

const SUPABASE_URL = 'https://clpcskkoguomoihnisai.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjYyMTIsImV4cCI6MjA3MDgwMjIxMn0.TpZQuKm0cVvl7lJbXt2Iw1_s3HlLLIIbRr7lIOyVsBo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentEditId = null;

// Authentication
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        document.getElementById('auth-error').textContent = error.message;
        return;
    }
    
    showAdminPanel();
    loadAllData();
}

async function logout() {
    await supabaseClient.auth.signOut();
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('admin-container').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
}

// Check if user is already logged in
supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        showAdminPanel();
        loadAllData();
    }
});

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        showAdminPanel();
        loadAllData();
    } else {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('admin-container').style.display = 'none';
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

// Load all data
function loadAllData() {
    loadAnalytics();
    loadFAQs();
}

// Auto-refresh analytics every 30 seconds
setInterval(loadAnalytics, 30000);

