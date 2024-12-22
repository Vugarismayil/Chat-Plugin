class LiveChatWidget {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || window.location.origin;
    this.position = options.position || 'bottom-right';
    this.theme = options.theme || {
      primary: '#2196f3',
      secondary: '#ffffff'
    };
    
    this.initialize();
  }

  initialize() {
    // Widget HTML'ini oluştur
    const widgetHtml = `
      <div id="live-chat-widget" style="position: fixed; ${this.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}">
        <div id="chat-button" style="background: ${this.theme.primary}; color: ${this.theme.secondary}; padding: 12px 24px; border-radius: 25px; cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
          <span>Canlı Destek</span>
        </div>
        <div id="chat-container" style="display: none; position: fixed; bottom: 80px; right: 20px; width: 300px; height: 400px; background: white; border-radius: 10px; box-shadow: 0 5px 25px rgba(0,0,0,0.1);">
          <div id="chat-header" style="background: ${this.theme.primary}; color: ${this.theme.secondary}; padding: 15px; border-radius: 10px 10px 0 0;">
            <span>Canlı Destek</span>
            <span id="close-chat" style="float: right; cursor: pointer;">✕</span>
          </div>
          <div id="chat-messages" style="height: 300px; overflow-y: auto; padding: 15px;"></div>
          <div id="chat-input" style="padding: 15px; border-top: 1px solid #eee;">
            <input type="text" placeholder="Mesajınızı yazın..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
        </div>
      </div>
    `;

    // Widget'ı sayfaya ekle
    const div = document.createElement('div');
    div.innerHTML = widgetHtml;
    document.body.appendChild(div);

    // Socket.io'yu yükle
    const script = document.createElement('script');
    script.src = '/socket.io/socket.io.js';
    script.onload = () => this.initializeSocket();
    document.head.appendChild(script);

    // Event listener'ları ekle
    this.addEventListeners();
  }

  initializeSocket() {
    this.socket = io(this.serverUrl);
    
    this.socket.on('connect', () => {
      console.log('Socket bağlantısı başarılı');
    });

    this.socket.on('chatStarted', ({ chatId }) => {
      this.chatId = chatId;
    });

    this.socket.on('newMessage', (message) => {
      this.addMessage(message);
    });
  }

  addEventListeners() {
    const chatButton = document.getElementById('chat-button');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const input = document.querySelector('#chat-input input');

    chatButton.addEventListener('click', () => {
      chatContainer.style.display = 'block';
      if (!this.chatId) {
        this.socket.emit('startChat', {
          url: window.location.href,
          title: document.title
        });
      }
    });

    closeChat.addEventListener('click', () => {
      chatContainer.style.display = 'none';
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.socket.emit('sendMessage', {
          chatId: this.chatId,
          message: input.value.trim(),
          sender: 'visitor'
        });
        input.value = '';
      }
    });
  }

  addMessage(message) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.style.margin = '10px 0';
    messageElement.style.padding = '8px 12px';
    messageElement.style.borderRadius = '15px';
    messageElement.style.maxWidth = '80%';
    messageElement.style.wordWrap = 'break-word';

    if (message.sender === 'visitor') {
      messageElement.style.marginLeft = 'auto';
      messageElement.style.background = this.theme.primary;
      messageElement.style.color = this.theme.secondary;
    } else {
      messageElement.style.background = '#f0f0f0';
      messageElement.style.color = '#000';
    }

    messageElement.textContent = message.text;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Global değişken olarak widget'ı ekle
window.LiveChatWidget = LiveChatWidget; 