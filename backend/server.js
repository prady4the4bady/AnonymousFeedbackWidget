const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const nodemailer = require('nodemailer');
require('dotenv').config();

// AnonymousFeedbackWidget - Privacy-First Feedback Collection
// Made by prady

const app = express();
const PORT = process.env.PORT || 3002;

// Database setup
const defaultData = { feedback: [], settings: { notifications: { email: '' } } };
const adapter = new JSONFile('./db.json');
const db = new Low(adapter, defaultData);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting - allow 5 feedback submissions per hour per IP
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many feedback submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/feedback', feedbackLimiter);

// Routes
app.post('/api/feedback', async (req, res) => {
  try {
    const { message, page, followUp, widgetId } = req.body;

    // Validate required fields
    if (!message || !page) {
      return res.status(400).json({ error: 'Message and page are required' });
    }

    // Create feedback entry
    const feedback = {
      id: uuidv4(),
      message: message.trim(),
      page,
      followUp: followUp || null,
      widgetId: widgetId || 'default',
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      moderated: false,
      archived: false
    };

    // Save to database
    await db.read();
    db.data.feedback.push(feedback);
    await db.write();

    // Send notification if email is configured
    if (db.data.settings.notifications.email) {
      await sendNotificationEmail(feedback);
    }

    res.status(201).json({
      success: true,
      id: feedback.id,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    const { page, limit = 50, offset = 0, moderated } = req.query;

    await db.read();
    let feedback = db.data.feedback;

    // Filter by moderation status if specified
    if (moderated !== undefined) {
      feedback = feedback.filter(f => f.moderated === (moderated === 'true'));
    }

    // Filter by page if specified
    if (page) {
      feedback = feedback.filter(f => f.page === page);
    }

    // Sort by timestamp (newest first)
    feedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const total = feedback.length;
    const paginatedFeedback = feedback.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      feedback: paginatedFeedback,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/feedback/:id/moderate', async (req, res) => {
  try {
    const { id } = req.params;
    const { moderated, archived } = req.body;

    await db.read();
    const feedback = db.data.feedback.find(f => f.id === id);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    feedback.moderated = moderated !== undefined ? moderated : feedback.moderated;
    feedback.archived = archived !== undefined ? archived : feedback.archived;

    await db.write();

    res.json({ success: true, feedback });

  } catch (error) {
    console.error('Error moderating feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    await db.read();
    res.json(db.data.settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { notifications } = req.body;

    await db.read();
    db.data.settings = { ...db.data.settings, notifications };
    await db.write();

    res.json({ success: true, settings: db.data.settings });

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email notification function
async function sendNotificationEmail(feedback) {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP not configured, skipping email notification');
      return;
    }

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: db.data.settings.notifications.email,
      subject: 'New Anonymous Feedback Received',
      html: `
        <h2>New Feedback Received</h2>
        <p><strong>Page:</strong> ${feedback.page}</p>
        <p><strong>Message:</strong></p>
        <p>${feedback.message}</p>
        ${feedback.followUp ? `<p><strong>Follow-up:</strong> ${feedback.followUp}</p>` : ''}
        <p><strong>Time:</strong> ${new Date(feedback.timestamp).toLocaleString()}</p>
        <hr>
        <p><a href="${process.env.ADMIN_URL || 'http://localhost:3003'}">View in Admin Panel</a></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Notification email sent');

  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}

// Initialize database and start server
async function startServer() {
  await db.read();
  await db.write();

  app.listen(PORT, () => {
    console.log(`Anonymous Feedback API running on port ${PORT}`);
    console.log(`👨‍💻 Made by prady`);
  });
}

startServer().catch(console.error);