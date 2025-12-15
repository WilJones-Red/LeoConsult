document.addEventListener('DOMContentLoaded', function() {
    // Create chat bubble
    const chatBubble = document.createElement('div');
    chatBubble.id = 'leo-chatbot-bubble';
    chatBubble.innerHTML = `<img src="assets/Logosep.png" alt="Chat" style="width:48px;height:48px;">`;
    document.body.appendChild(chatBubble);

    // Create chat widget (hidden by default)
    const chatWidget = document.createElement('div');
    chatWidget.id = 'leo-chatbot-widget';
    chatWidget.innerHTML = `
        <div class="chatbot-header">Leo Support <span id="chatbot-close">&times;</span></div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <form id="chatbot-form">
            <input type="text" id="chatbot-input" placeholder="Type your question..." autocomplete="off" required />
            <button type="submit">Send</button>
        </form>
    `;
    chatWidget.style.display = 'none';
    document.body.appendChild(chatWidget);

    // Show chat on bubble click
    chatBubble.onclick = function() {
        chatWidget.style.display = 'block';
        chatBubble.style.display = 'none';
    };
    // Hide chat and show bubble on close
    const closeBtn = chatWidget.querySelector('#chatbot-close');
    closeBtn.onclick = function() {
        chatWidget.style.display = 'none';
        chatBubble.style.display = 'block';
    };

    // Handle form submit
    const form = chatWidget.querySelector('#chatbot-form');
    const input = chatWidget.querySelector('#chatbot-input');
    const messages = chatWidget.querySelector('#chatbot-messages');
    form.onsubmit = async function(e) {
        e.preventDefault();
        const userMsg = input.value.trim();
        if (!userMsg) return;
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chatbot-msg user';
        userMessageDiv.textContent = userMsg;
        messages.appendChild(userMessageDiv);
        input.value = '';
        messages.scrollTop = messages.scrollHeight;
        // Send to backend
        try {
            const res = await fetch('https://clpcskkoguomoihnisai.supabase.co/rest/v1/rpc/match_faq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIyNjIxMiwiZXhwIjoyMDcwODAyMjEyfQ.XuwIPzfFdebMIQMn9QGsshkkvKX4yBQzlDG6-KH81K8',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIyNjIxMiwiZXhwIjoyMDcwODAyMjEyfQ.XuwIPzfFdebMIQMn9QGsshkkvKX4yBQzlDG6-KH81K8'
                },
                body: JSON.stringify({ "user_query": userMsg })
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Response data:', data); // Debug log
            
            // Get first result from the array
            const response = data[0]?.answer || "I'm sorry, I couldn't understand that.";
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chatbot-msg bot';
            botMessageDiv.textContent = response;
            messages.appendChild(botMessageDiv);
            messages.scrollTop = messages.scrollHeight;
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chatbot-msg bot error';
            errorDiv.textContent = 'Sorry, something went wrong. Please try again.';
            messages.appendChild(errorDiv);
            messages.scrollTop = messages.scrollHeight;
        }
    };
});

// Basic styles (could be moved to CSS)
const style = document.createElement('style');
style.innerHTML = `
#leo-chatbot-bubble {
    position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; background: #fff; border-radius: 50%; box-shadow: 0 4px 24px rgba(0,0,0,0.18); z-index: 9999; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #667eea; transition: box-shadow 0.2s; }
#leo-chatbot-bubble:hover { box-shadow: 0 8px 32px rgba(102,126,234,0.25); }
#leo-chatbot-widget {
    position: fixed; bottom: 24px; right: 24px; width: 320px; background: #fff; border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.18); z-index: 9999; font-family: 'Inter', sans-serif;
    border: 1px solid #e0e0e0; overflow: hidden;
}
.chatbot-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 12px 16px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
#chatbot-close { cursor: pointer; font-size: 1.2em; }
.chatbot-messages { max-height: 220px; overflow-y: auto; padding: 12px; background: #fafaff; min-height: 80px; display: flex; flex-direction: column; }
.chatbot-msg { margin-bottom: 10px; padding: 8px 12px; border-radius: 8px; max-width: 85%; word-break: break-word; }
.chatbot-msg.user { background: #e7eafe; align-self: flex-end; margin-left: auto; text-align: right; color: #222; }
.chatbot-msg.bot { background: #f3f3f7; color: #222; }
.chatbot-msg.bot.error { background: #ffeaea; color: #b00; }
#chatbot-form { display: flex; border-top: 1px solid #eee; }
#chatbot-input { flex: 1; border: none; padding: 10px; font-size: 1em; border-radius: 0 0 0 12px; outline: none; }
#chatbot-form button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; padding: 0 18px; border-radius: 0 0 12px 0; font-weight: 600; cursor: pointer; }
`;
document.head.appendChild(style);


