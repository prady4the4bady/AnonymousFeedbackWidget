# 💬 Anonymous Micro Feedback Widget

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Feedback](https://img.shields.io/badge/Feedback-Anonymous-orange.svg)](https://github.com/prady4the4bady/AnonymousFeedbackWidget)

**Made by prady**

A privacy-first feedback collection widget that allows users to submit anonymous feedback without any tracking or personal data collection.

## 📋 Problem

Small product teams need qualitative UX feedback without:
- User tracking or IP logging
- Complex setup requirements
- Privacy concerns
- High maintenance overhead

## 🎯 Solution

A simple embeddable JavaScript widget that collects:
- ✅ One-time feedback per page load
- ✅ Optional follow-up questions
- ✅ Anonymous submissions (no user data)
- ✅ Moderation queue for review
- ✅ Email notifications
- ✅ Clean admin dashboard

## ✨ Key Features

- 🔒 **Privacy-First**: No cookies, no tracking, no personal data
- 📝 **One-Shot Feedback**: Users can only submit once per page
- 🎯 **Optional Follow-ups**: Expandable form for detailed feedback
- 🛡️ **Moderation Queue**: Review feedback before public access
- 📧 **Email Notifications**: Get notified of new submissions
- 🎨 **Customizable**: Position, theme, and messaging options
- 📊 **Admin Dashboard**: View, filter, and manage all feedback

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/prady4the4bady/AnonymousFeedbackWidget.git
cd AnonymousFeedbackWidget
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (optional, for development)
cd ../frontend
npm install

# Admin (optional, for development)
cd ../admin
npm install
```

### 3. Start the Backend
```bash
cd backend
npm start
# Server runs on http://localhost:3002
```

### 4. Start the Admin Dashboard
```bash
cd admin
npm start
# Admin dashboard on http://localhost:3003
```

### 5. Embed the Widget

Add this script to your website:
```html
<script src="https://your-domain.com/frontend/widget.js"></script>
```

With custom configuration:
```html
<script>
  window.AnonymousFeedbackConfig = {
    apiUrl: 'https://your-api-domain.com',
    widgetId: 'your-site',
    position: 'bottom-right',
    theme: 'light',
    triggerText: '💬 Feedback',
    thankYouText: 'Thanks for your feedback!',
    followUpEnabled: true,
    followUpQuestion: 'Would you like to elaborate?'
  };
</script>
<script src="https://your-domain.com/frontend/widget.js"></script>
```

## 🏗️ Architecture

```
AnonymousFeedbackWidget/
├── backend/              # Node.js Express API server
│   ├── server.js        # Main API server
│   ├── package.json     # Backend dependencies
│   └── db.json         # JSON file database (dev)
├── frontend/            # Embeddable widget
│   └── widget.js       # Main widget script
├── admin/               # Admin dashboard
│   ├── index.html      # Admin interface
│   └── package.json    # Admin dependencies
├── demo.html           # Demo page
└── README.md          # This file
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | string | `'http://localhost:3002'` | Backend API URL |
| `widgetId` | string | `'default'` | Unique widget identifier |
| `position` | string | `'bottom-right'` | Widget position |
| `theme` | string | `'light'` | Color theme |
| `triggerText` | string | `'💬 Feedback'` | Trigger button text |
| `thankYouText` | string | `'Thanks for your feedback!'` | Success message |
| `followUpEnabled` | boolean | `true` | Enable follow-up questions |
| `followUpQuestion` | string | `'Would you like to elaborate?'` | Follow-up placeholder |

## 📊 API Endpoints

### Submit Feedback
```http
POST /api/feedback
Content-Type: application/json

{
  "message": "User feedback message",
  "followUp": "Optional follow-up details",
  "page": "https://example.com/page",
  "widgetId": "your-widget-id"
}
```

### Get Feedback (Admin)
```http
GET /api/feedback?page=1&limit=50&moderated=false
```

### Moderate Feedback
```http
PUT /api/feedback/{id}/moderate
Content-Type: application/json

{
  "moderated": true,
  "archived": false
}
```

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # With nodemon
```

### Widget Development
```bash
cd frontend
npm run dev  # Webpack watch mode
```

### Testing
```bash
cd backend
npm test
```

## 📧 Email Notifications

Configure SMTP settings in your environment:
```bash
# .env file in backend directory
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm install --production
npm start
```

### Static Files
Host the `frontend/widget.js` and `admin/` directory on your web server.

### Docker (Optional)
```bash
# Build and run with Docker
docker build -t feedback-backend ./backend
docker run -p 3002:3002 feedback-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Express.js, LowDB, and vanilla JavaScript
- Inspired by the need for privacy-first user feedback
- Designed for developers who value user privacy

---

**Made with ❤️ for better, more ethical user feedback collection**