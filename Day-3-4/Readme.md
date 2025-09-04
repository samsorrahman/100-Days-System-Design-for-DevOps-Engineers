# Kafka Event-Driven Architecture Example

A complete implementation of Event-Driven Architecture (EDA) using Apache Kafka, Node.js, and Express. This project demonstrates how to build loosely coupled, scalable microservices that communicate through events.

## 636363 Architecture Overview

This application showcases a real-world event-driven system with:

- **Event Bus**: Apache Kafka handles event publishing and consumption
- **Business Services**: User, Order, and Notification services
- **Event Handlers**: Asynchronous event processing
- **REST API**: Express.js endpoints for interaction
- **Monitoring**: Kafka UI for real-time event monitoring

### Event Flow
```
API Request 26 Service 26 Event Published 26 Kafka 26 Event Consumed 26 Side Effects
```

## 6363 Features

- **Loose Coupling**: Services communicate only through events
- **Scalability**: Independent scaling of producers and consumers
- **Reliability**: Event persistence and replay capabilities
- **Monitoring**: Real-time event tracking with Kafka UI
- **Graceful Shutdown**: Proper cleanup of resources

## 6363 Prerequisites

- **Docker Desktop** (v20.10+)
- **Node.js** (v16+)
- **npm** (v8+)

## 636363 Quick Start

### 1. Clone and Setup

```bash
git clone <https://github.com/samsorrahman/100-Days-System-Design-for-DevOps-Engineers>
cd Day-3-4
npm install
```

### 2. Start Kafka Infrastructure

```bash
# Start Kafka, Zookeeper, and Kafka UI
docker-compose up -d

# Verify all containers are running
docker-compose ps
```

Expected output:
```
NAME        IMAGE                              STATUS
kafka       confluentinc/cp-kafka:7.4.0        Up (healthy)
kafka-ui    provectuslabs/kafka-ui:latest      Up
zookeeper   confluentinc/cp-zookeeper:7.4.0    Up
```

### 3. Start the Application

```bash
# Wait 2-3 minutes for Kafka to be ready, then:
npm start
```

Expected output:
```
63 Kafka producer connected
63 Topics created/verified
63 Consumer user-handler started for topics: user-events
63 Consumer order-handler started for topics: order-events
63 Consumer notification-analytics started for topics: notification-events
6363 Server running on port 3000
```

### 4. Test the System

```bash
# Run automated tests
npm test

# Or manually test endpoints
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "age": 30}'
```

## 6363 Monitoring

- **Kafka UI**: http://localhost:8080 - Monitor topics, messages, and consumers
- **API Health**: http://localhost:3000/health - Application health check

## 6363 API Endpoints

### Users
- `POST /users` - Register new user
- `PUT /users/:userId` - Update user profile

### Orders
- `POST /orders` - Create new order
- `PUT /orders/:orderId/complete` - Complete order

### Health
- `GET /health` - Application health status

## 6363 Event Types

### Topics
- `user-events` - User registration and profile updates
- `order-events` - Order creation and completion
- `notification-events` - Notification delivery events

### Event Structure
```javascript
{
  id: "uuid",
  type: "USER_REGISTERED",
  timestamp: "2025-09-04T13:30:00.000Z",
  userId: "user-uuid",
  data: { /* event-specific data */ }
}
```

## 636363 Project Structure

```
kafka-event-driven-app/
195196196 docker-compose.yml    # Kafka infrastructure
195196196 package.json         # Dependencies and scripts
195196196 server.js           # Main application
195196196 test-api.js         # API testing script
192196196 README.md           # This file
```

## 6363 Testing Examples

### Create User (Triggers Welcome Notification)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "age": 28
  }'
```

### Create Order (Triggers Order Notification)
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "items": [{"name": "Laptop", "price": 999.99, "quantity": 1}],
    "total": 999.99
  }'
```

## 6363 Troubleshooting

### Kafka Connection Issues
```bash
# Check container status
docker-compose ps

# View Kafka logs
docker-compose logs kafka

# Restart services
docker-compose restart kafka
```

### Port Conflicts
```bash
# Windows
netstat -ano | findstr :9092

# Linux/Mac
lsof -i :9092
```

### Clean Restart
```bash
# Stop everything
docker-compose down -v

# Remove old data and restart
docker-compose up -d
```

## 636363 Architecture Benefits

### Loose Coupling
Services don't directly depend on each other - they only care about events

### Scalability
- Scale producers and consumers independently
- Add new event handlers without touching existing code
- Horizontal scaling through Kafka partitions

### Reliability
- Events are persisted in Kafka
- Failed events can be replayed
- Consumer groups provide fault tolerance

### Observability
- All events flow through Kafka (audit trail)
- Real-time monitoring with Kafka UI
- Event-driven analytics

## 6363 Event Flow Example

1. **User Registration**:
   ```
   POST /users 26 USER_REGISTERED event 26 Welcome notification sent 26 Analytics logged
   ```

2. **Order Processing**:
   ```
   POST /orders 26 ORDER_CREATED event 26 Order notification sent
   PUT /orders/complete 26 ORDER_COMPLETED event 26 Completion notification sent
   ```

## 6363 Dependencies

### Core Dependencies
- `kafkajs` - Kafka client for Node.js
- `express` - Web framework
- `uuid` - Unique ID generation

### Infrastructure
- `confluentinc/cp-kafka:7.4.0` - Apache Kafka
- `confluentinc/cp-zookeeper:7.4.0` - Zookeeper
- `provectuslabs/kafka-ui:latest` - Kafka monitoring UI

## 6363 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Application port |
| `KAFKA_BROKERS` | `localhost:9092` | Kafka broker endpoints |
| `KAFKAJS_NO_PARTITIONER_WARNING` | - | Suppress partitioner warnings |

## 6363 Learn More

### Event-Driven Architecture Concepts
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Saga Patterns](https://microservices.io/patterns/data/saga.html)

### Kafka Resources
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [KafkaJS Documentation](https://kafka.js.org/)
- [Confluent Developer](https://developer.confluent.io/)

## 6363 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 6363 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 636363 Keywords

- Event-Driven Architecture
- Apache Kafka
- Microservices
- Node.js
- Express.js
- Asynchronous Processing
- Message Queues
- Event Sourcing

## 6363636363 Author

Your Name - [GitHub Profile](https://github.com/samsorrahman)

---

**63 If this project helped you understand Event-Driven Architecture, please give it a star!**
