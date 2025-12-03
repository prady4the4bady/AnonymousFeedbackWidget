// Anonymous Micro Feedback Widget
// Embed this script on your website to collect anonymous feedback

(function() {
  'use strict';

  // Configuration
  const CONFIG = window.AnonymousFeedbackConfig || {
    apiUrl: 'http://localhost:3002',
    widgetId: 'default',
    position: 'bottom-right',
    theme: 'light',
    triggerText: '💬 Feedback',
    thankYouText: 'Thanks for your feedback!',
    followUpEnabled: true,
    followUpQuestion: 'Would you like to elaborate?'
  };

  // Prevent multiple initializations
  if (window.AnonymousFeedbackWidget) {
    return;
  }
  window.AnonymousFeedbackWidget = true;

  // Check if user has already submitted feedback on this page
  const pageKey = `feedback_${CONFIG.widgetId}_${window.location.pathname}`;
  if (localStorage.getItem(pageKey)) {
    return; // User already submitted feedback on this page
  }

  // Create widget container
  const widget = document.createElement('div');
  widget.id = 'anonymous-feedback-widget';
  widget.innerHTML = `
    <style>
      #anonymous-feedback-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: fixed;
        z-index: 9999;
        ${getPositionStyles(CONFIG.position)}
      }

      #feedback-trigger {
        background: ${CONFIG.theme === 'dark' ? '#333' : '#fff'};
        color: ${CONFIG.theme === 'dark' ? '#fff' : '#333'};
        border: 2px solid ${CONFIG.theme === 'dark' ? '#555' : '#ddd'};
        border-radius: 50px;
        padding: 12px 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        font-size: 14px;
        font-weight: 500;
      }

      #feedback-trigger:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }

      #feedback-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }

      #feedback-form {
        position: absolute;
        ${getModalPosition(CONFIG.position)}
        background: ${CONFIG.theme === 'dark' ? '#333' : '#fff'};
        color: ${CONFIG.theme === 'dark' ? '#fff' : '#333'};
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease;
      }

      #feedback-form h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
      }

      #feedback-message {
        width: 100%;
        min-height: 80px;
        padding: 12px;
        border: 1px solid ${CONFIG.theme === 'dark' ? '#555' : '#ddd'};
        border-radius: 8px;
        background: ${CONFIG.theme === 'dark' ? '#444' : '#fff'};
        color: ${CONFIG.theme === 'dark' ? '#fff' : '#333'};
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        margin-bottom: 16px;
      }

      #feedback-followup {
        width: 100%;
        min-height: 60px;
        padding: 12px;
        border: 1px solid ${CONFIG.theme === 'dark' ? '#555' : '#ddd'};
        border-radius: 8px;
        background: ${CONFIG.theme === 'dark' ? '#444' : '#fff'};
        color: ${CONFIG.theme === 'dark' ? '#fff' : '#333'};
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        margin-bottom: 16px;
        display: none;
      }

      #followup-toggle {
        display: block;
        margin-bottom: 16px;
        color: #007bff;
        cursor: pointer;
        font-size: 14px;
        text-decoration: underline;
      }

      #followup-toggle:hover {
        color: #0056b3;
      }

      #feedback-submit {
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        width: 100%;
        transition: background 0.3s ease;
      }

      #feedback-submit:hover {
        background: #0056b3;
      }

      #feedback-submit:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      #feedback-close {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: ${CONFIG.theme === 'dark' ? '#ccc' : '#666'};
        padding: 4px;
        line-height: 1;
      }

      #feedback-thankyou {
        display: none;
        text-align: center;
        padding: 40px 20px;
      }

      #feedback-thankyou h3 {
        color: #28a745;
        margin-bottom: 8px;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: ${getSlideAnimation(CONFIG.position)};
        }
        to {
          opacity: 1;
          transform: translate(0, 0);
        }
      }

      @media (max-width: 480px) {
        #feedback-form {
          margin: 20px;
          padding: 20px;
        }
      }
    </style>

    <button id="feedback-trigger">${CONFIG.triggerText}</button>

    <div id="feedback-modal">
      <div id="feedback-form">
        <button id="feedback-close">&times;</button>
        <h3>Share your feedback</h3>
        <textarea id="feedback-message" placeholder="What's on your mind?" maxlength="1000"></textarea>

        ${CONFIG.followUpEnabled ? `
          <div id="followup-toggle">+ Add more details</div>
          <textarea id="feedback-followup" placeholder="${CONFIG.followUpQuestion}" maxlength="500"></textarea>
        ` : ''}

        <button id="feedback-submit">Send Feedback</button>
      </div>

      <div id="feedback-thankyou">
        <h3>${CONFIG.thankYouText}</h3>
        <p>Your feedback helps us improve!</p>
      </div>
    </div>
  `;

  document.body.appendChild(widget);

  // Event listeners
  const trigger = widget.querySelector('#feedback-trigger');
  const modal = widget.querySelector('#feedback-modal');
  const form = widget.querySelector('#feedback-form');
  const thankyou = widget.querySelector('#feedback-thankyou');
  const messageInput = widget.querySelector('#feedback-message');
  const followupInput = widget.querySelector('#feedback-followup');
  const followupToggle = widget.querySelector('#followup-toggle');
  const submitBtn = widget.querySelector('#feedback-submit');
  const closeBtn = widget.querySelector('#feedback-close');

  // Show modal
  trigger.addEventListener('click', () => {
    modal.style.display = 'block';
    messageInput.focus();
  });

  // Close modal
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Follow-up toggle
  if (followupToggle) {
    followupToggle.addEventListener('click', () => {
      const isVisible = followupInput.style.display !== 'none';
      followupInput.style.display = isVisible ? 'none' : 'block';
      followupToggle.textContent = isVisible ? '+ Add more details' : '- Hide details';
      if (!isVisible) {
        followupInput.focus();
      }
    });
  }

  // Submit feedback
  submitBtn.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    const followUp = followupInput ? followupInput.value.trim() : null;

    if (!message) {
      alert('Please enter your feedback message.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await fetch(`${CONFIG.apiUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          followUp: followUp || null,
          page: window.location.href,
          widgetId: CONFIG.widgetId
        })
      });

      if (response.ok) {
        // Mark as submitted for this page
        localStorage.setItem(pageKey, 'true');

        // Show thank you message
        form.style.display = 'none';
        thankyou.style.display = 'block';

        // Auto-close after 3 seconds
        setTimeout(() => {
          closeModal();
        }, 3000);

      } else {
        throw new Error('Failed to submit feedback');
      }

    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to submit feedback. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
    }
  });

  function closeModal() {
    modal.style.display = 'none';
    form.style.display = 'block';
    thankyou.style.display = 'none';
    messageInput.value = '';
    if (followupInput) followupInput.value = '';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Feedback';
  }

  // Helper functions
  function getPositionStyles(position) {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;'
    };
    return positions[position] || positions['bottom-right'];
  }

  function getModalPosition(position) {
    const positions = {
      'bottom-right': 'bottom: 80px; right: 20px;',
      'bottom-left': 'bottom: 80px; left: 20px;',
      'top-right': 'top: 80px; right: 20px;',
      'top-left': 'top: 80px; left: 20px;'
    };
    return positions[position] || positions['bottom-right'];
  }

  function getSlideAnimation(position) {
    const animations = {
      'bottom-right': 'translate(20px, 20px)',
      'bottom-left': 'translate(-20px, 20px)',
      'top-right': 'translate(20px, -20px)',
      'top-left': 'translate(-20px, -20px)'
    };
    return animations[position] || animations['bottom-right'];
  }

})();