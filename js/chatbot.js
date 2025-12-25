document.addEventListener('DOMContentLoaded', function() {
    // Create chat bubble with better visibility
    const chatBubble = document.createElement('div');
    chatBubble.id = 'leo-chatbot-bubble';
    chatBubble.innerHTML = `
        <div class="chat-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="#1E40AF"/>
                <circle cx="8" cy="10" r="1.5" fill="#1E40AF"/>
                <circle cx="12" cy="10" r="1.5" fill="#1E40AF"/>
                <circle cx="16" cy="10" r="1.5" fill="#1E40AF"/>
            </svg>
        </div>
        <div class="chat-tooltip">Need help? Chat with us!</div>
    `;
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
        // Show intro message if not already present
        const messages = chatWidget.querySelector('#chatbot-messages');
        if (!messages.querySelector('.chatbot-msg.bot.intro')) {
            const introDiv = document.createElement('div');
            introDiv.className = 'chatbot-msg bot intro';
            introDiv.textContent = 'Hello! I am Leo AI assistant. How can I help you today?';
            messages.appendChild(introDiv);
        }
    };
    
    // Hide chat and show bubble on close
    const closeBtn = chatWidget.querySelector('#chatbot-close');
    closeBtn.onclick = function() {
        chatWidget.style.display = 'none';
        chatBubble.style.display = 'flex';
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
        
        // Send to AI Edge Function
        try {
            const res = await fetch('https://clpcskkoguomoihnisai.supabase.co/functions/v1/chat-faq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjYyMTIsImV4cCI6MjA3MDgwMjIxMn0.vTKzS5TCN8KiHXSRXN2-sBJy0CdOHlLbAR84q9pqRvI',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjYyMTIsImV4cCI6MjA3MDgwMjIxMn0.vTKzS5TCN8KiHXSRXN2-sBJy0CdOHlLbAR84q9pqRvI'
                },
                body: JSON.stringify({ query: userMsg })
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('AI Response:', data);
            
            // Extract answer from AI response
            const response = data.answer || "I'm sorry, I couldn't understand that.";
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chatbot-msg bot';
            
            // Convert URLs to clickable links if not already HTML
            const linkifiedResponse = response.replace(
                /<a\s+(?:[^>]*?\s+)?href="([^"]*)"(?:[^>]*)>(.*?)<\/a>/gi,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
            );
            
            botMessageDiv.innerHTML = linkifiedResponse;
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

    // Add styles
    const style = document.createElement('style');
    style.innerHTML = `
#leo-chatbot-bubble {
    position: fixed; 
    bottom: 24px; 
    right: 24px; 
    width: 64px; 
    height: 64px; 
    background: #fff; 
    border-radius: 50%; 
    box-shadow: 0 4px 24px rgba(30, 64, 175, 0.25); 
    z-index: 9999; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    border: 3px solid #1E40AF; 
    transition: all 0.3s ease;
    animation: pulse-chat 2s infinite;
}
@keyframes pulse-chat {
    0%, 100% { 
        box-shadow: 0 4px 24px rgba(30, 64, 175, 0.25); 
        transform: scale(1);
    }
    50% { 
        box-shadow: 0 4px 32px rgba(30, 64, 175, 0.4); 
        transform: scale(1.05);
    }
}
#leo-chatbot-bubble:hover { 
    box-shadow: 0 8px 32px rgba(30, 64, 175, 0.35); 
    transform: scale(1.08);
    animation: none;
}
.chat-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
}
.chat-tooltip {
    position: absolute;
    bottom: 50%;
    right: 75px;
    background: #1E40AF;
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    transform: translateY(50%);
    z-index: 1;
}
.chat-tooltip::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 6px solid #1E40AF;
}
#leo-chatbot-bubble:hover .chat-tooltip {
    opacity: 1;
}
#leo-chatbot-widget {
    position: fixed; 
    bottom: 24px; 
    right: 24px; 
    width: 320px; 
    background: #fff; 
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.18); 
    z-index: 9999; 
    font-family: 'Inter', sans-serif;
    border: 1px solid #e0e0e0; 
    overflow: hidden;
}
.chatbot-header { 
    background: #1E40AF; 
    color: #fff; 
    padding: 12px 16px; 
    font-weight: 600; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
}
#chatbot-close { 
    cursor: pointer; 
    font-size: 1.2em; 
}
.chatbot-messages { 
    max-height: 220px; 
    overflow-y: auto; 
    padding: 12px; 
    background: #fafaff; 
    min-height: 80px; 
    display: flex; 
    flex-direction: column; 
}
.chatbot-msg { 
    margin-bottom: 10px; 
    padding: 8px 12px; 
    border-radius: 8px; 
    max-width: 85%; 
    word-break: break-word; 
}
.chatbot-msg.user { 
    background: #e7eafe; 
    align-self: flex-end; 
    margin-left: auto; 
    text-align: right; 
    color: #222; 
}
.chatbot-msg.bot { 
    background: #f3f3f7; 
    color: #222; 
}
.chatbot-msg.bot.error { 
    background: #ffeaea; 
    color: #b00; 
}
#chatbot-form { 
    display: flex; 
    border-top: 1px solid #eee; 
}
#chatbot-input { 
    flex: 1; 
    border: none; 
    padding: 10px; 
    font-size: 1em; 
    border-radius: 0 0 0 12px; 
    outline: none; 
}
#chatbot-form button { 
    background: #1E40AF; 
    color: #fff; 
    border: none; 
    padding: 0 18px; 
    border-radius: 0 0 12px 0; 
    font-weight: 600; 
    cursor: pointer; 
}
`;
    document.head.appendChild(style);
});


