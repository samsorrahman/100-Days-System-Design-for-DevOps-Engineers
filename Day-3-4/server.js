// package.json dependencies needed:
// npm install kafkajs express uuid

const { Kafka } = require('kafkajs');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Kafka Configuration
const kafka = new Kafka({
  clientId: 'event-driven-app',
  brokers: ['localhost:9092']
});

// Event Topics
const TOPICS = {
  USER_EVENTS: 'user-events',
  ORDER_EVENTS: 'order-events',
  NOTIFICATION_EVENTS: 'notification-events'
};

// Event Types
const EVENT_TYPES = {
  USER_REGISTERED: 'USER_REGISTERED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  NOTIFICATION_SENT: 'NOTIFICATION_SENT'
};

class EventBus {
  constructor() {
    this.producer = kafka.producer();
    this.consumers = new Map();
  }

  async initialize() {
    await this.producer.connect();
    console.log('✅ Kafka producer connected');
    
    // Create topics if they don't exist
    const admin = kafka.admin();
    await admin.connect();
    
    try {
      await admin.createTopics({
        topics: Object.values(TOPICS).map(topic => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1
        }))
      });
      console.log('✅ Topics created/verified');
    } catch (error) {
      console.log('Topics already exist or error:', error.message);
    }
    
    await admin.disconnect();
  }

  async publishEvent(topic, eventType, data, userId = null) {
    const event = {
      id: uuidv4(),
      type: eventType,
      timestamp: new Date().toISOString(),
      userId,
      data
    };

    try {
      await this.producer.send({
        topic,
        messages: [{
          key: event.id,
          value: JSON.stringify(event),
          headers: {
            eventType,
            userId: userId || 'anonymous'
          }
        }]
      });
      
      console.log(`📤 Event published: ${eventType} to ${topic}`);
      return event;
    } catch (error) {
      console.error('❌ Error publishing event:', error);
      throw error;
    }
  }

  async createConsumer(groupId, topics, handler) {
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topics });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`📥 Event received: ${event.type} from ${topic}`);
          await handler(event, topic, partition);
        } catch (error) {
          console.error('❌ Error processing message:', error);
        }
      }
    });

    this.consumers.set(groupId, consumer);
    console.log(`✅ Consumer ${groupId} started for topics: ${topics.join(', ')}`);
    return consumer;
  }

  async disconnect() {
    await this.producer.disconnect();
    for (const [groupId, consumer] of this.consumers) {
      await consumer.disconnect();
      console.log(`✅ Consumer ${groupId} disconnected`);
    }
  }
}

// Business Services
class UserService {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  async registerUser(userData) {
    // Simulate user registration logic
    const user = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    // Publish user registered event
    await this.eventBus.publishEvent(
      TOPICS.USER_EVENTS,
      EVENT_TYPES.USER_REGISTERED,
      user,
      user.id
    );

    return user;
  }

  async updateProfile(userId, updates) {
    // Simulate profile update logic
    const updatedProfile = { userId, updates, updatedAt: new Date().toISOString() };

    await this.eventBus.publishEvent(
      TOPICS.USER_EVENTS,
      EVENT_TYPES.USER_PROFILE_UPDATED,
      updatedProfile,
      userId
    );

    return updatedProfile;
  }
}

class OrderService {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  async createOrder(userId, orderData) {
    const order = {
      id: uuidv4(),
      userId,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await this.eventBus.publishEvent(
      TOPICS.ORDER_EVENTS,
      EVENT_TYPES.ORDER_CREATED,
      order,
      userId
    );

    return order;
  }

  async completeOrder(orderId, userId) {
    const completedOrder = {
      id: orderId,
      userId,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    await this.eventBus.publishEvent(
      TOPICS.ORDER_EVENTS,
      EVENT_TYPES.ORDER_COMPLETED,
      completedOrder,
      userId
    );

    return completedOrder;
  }
}

class NotificationService {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  async sendNotification(userId, message, type = 'info') {
    const notification = {
      id: uuidv4(),
      userId,
      message,
      type,
      sentAt: new Date().toISOString()
    };

    // Simulate sending notification (email, SMS, push, etc.)
    console.log(`🔔 Sending ${type} notification to user ${userId}: ${message}`);

    await this.eventBus.publishEvent(
      TOPICS.NOTIFICATION_EVENTS,
      EVENT_TYPES.NOTIFICATION_SENT,
      notification,
      userId
    );

    return notification;
  }
}

// Event Handlers (Consumers)
class EventHandlers {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  async handleUserEvents(event) {
    switch (event.type) {
      case EVENT_TYPES.USER_REGISTERED:
        await this.notificationService.sendNotification(
          event.userId,
          `Welcome ${event.data.name}! Your account has been created successfully.`,
          'welcome'
        );
        break;
      
      case EVENT_TYPES.USER_PROFILE_UPDATED:
        await this.notificationService.sendNotification(
          event.userId,
          'Your profile has been updated successfully.',
          'info'
        );
        break;
    }
  }

  async handleOrderEvents(event) {
    switch (event.type) {
      case EVENT_TYPES.ORDER_CREATED:
        await this.notificationService.sendNotification(
          event.userId,
          `Order #${event.data.id} has been created and is being processed.`,
          'order'
        );
        break;
      
      case EVENT_TYPES.ORDER_COMPLETED:
        await this.notificationService.sendNotification(
          event.userId,
          `Order #${event.data.id} has been completed successfully!`,
          'order'
        );
        break;
    }
  }

  handleNotificationEvents(event) {
    if (event.type === EVENT_TYPES.NOTIFICATION_SENT) {
      console.log(`📊 Analytics: Notification sent - Type: ${event.data.type}, User: ${event.userId}`);
    }
  }
}

// Express API Setup
async function createApp() {
  const app = express();
  app.use(express.json());

  // Initialize Event Bus
  const eventBus = new EventBus();
  await eventBus.initialize();

  // Initialize Services
  const userService = new UserService(eventBus);
  const orderService = new OrderService(eventBus);
  const notificationService = new NotificationService(eventBus);
  const eventHandlers = new EventHandlers(notificationService);

  // Set up Event Consumers
  await eventBus.createConsumer('user-handler', [TOPICS.USER_EVENTS], 
    (event) => eventHandlers.handleUserEvents(event));
  
  await eventBus.createConsumer('order-handler', [TOPICS.ORDER_EVENTS], 
    (event) => eventHandlers.handleOrderEvents(event));
  
  await eventBus.createConsumer('notification-analytics', [TOPICS.NOTIFICATION_EVENTS], 
    (event) => eventHandlers.handleNotificationEvents(event));

  // API Routes
  app.post('/users', async (req, res) => {
    try {
      const user = await userService.registerUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/users/:userId', async (req, res) => {
    try {
      const result = await userService.updateProfile(req.params.userId, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/orders', async (req, res) => {
    try {
      const order = await orderService.createOrder(req.body.userId, req.body);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/orders/:orderId/complete', async (req, res) => {
    try {
      const result = await orderService.completeOrder(req.params.orderId, req.body.userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await eventBus.disconnect();
    process.exit(0);
  });

  return app;
}

// Start the application
if (require.main === module) {
  createApp().then(app => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Kafka UI available at http://localhost:8080`);
      console.log(`🔗 API available at http://localhost:${PORT}`);
    });
  }).catch(console.error);
}

module.exports = { createApp, EventBus, EVENT_TYPES, TOPICS };