# Social Media Platform API - Design Document

## Overview

This document outlines the design and architecture of the Social Media Platform API, a RESTful backend service that provides core social media functionality such as user profiles, posts, likes, follows, hashtags, and personalized content feeds.

## System Architecture

The application follows a traditional 3-tier architecture:

1. **Presentation Layer**: RESTful API endpoints 
2. **Business Logic Layer**: Controllers and services
3. **Data Access Layer**: TypeORM repositories and entities

The system is built using:
- **Node.js** and **Express.js** as the web application framework
- **TypeORM** as the Object-Relational Mapper (ORM) for database operations
- **TypeScript** for type safety and improved developer experience
- **Joi** for request validation

## Database Design

### Entity Relationship Diagram (ERD)

```
┌─────────┐       ┌─────────┐       ┌─────────┐
│   User  │       │  Post   │       │ Hashtag │
├─────────┤       ├─────────┤       ├─────────┤
│ id      │       │ id      │       │ id      │
│ firstName│◄──┐  │ content │  ┌───►│ tag     │
│ lastName │   │  │ likeCount│  │    │ createdAt│
│ email   │   │  │ createdAt│  │    │ updatedAt│
│ createdAt│   │  │ updatedAt│  │    └─────────┘
│ updatedAt│   │  └─────────┘  │
└─────────┘   │       ▲        │
    ▲         │       │        │
    │         └───────┤        │
    │               Many-to-One│
    │                          │
    │                      Many-to-Many
    │         ┌─────────┐       
    │         │  Like   │       
    │         ├─────────┤       
    │         │ id      │       
Many-to-One   │ createdAt│       
    │         └─────────┘       
    │             ▲
    │             │
    │         Many-to-One
    │
    │         ┌─────────┐
    │         │ Follow  │
    └────────►├─────────┤
              │ id      │
              │ createdAt│
              └─────────┘
                   ▲
                   │
                Many-to-One
```

### Database Entities

1. **User**
   - Core entity representing application users
   - Has one-to-many relationships with Posts, Likes, and both sides of Follow

2. **Post**
   - Represents user-created content
   - Has many-to-one relationship with User (author)
   - Has many-to-many relationship with Hashtags
   - Has one-to-many relationship with Likes

3. **Like**
   - Join entity for users liking posts
   - Has many-to-one relationships with both User and Post
   - Includes a unique constraint to prevent duplicate likes

4. **Follow**
   - Join entity for users following other users
   - Has two many-to-one relationships with User (follower and following)
   - Includes a unique constraint to prevent duplicate follows

5. **Hashtag**
   - Represents topics/tags for categorizing posts
   - Has many-to-many relationship with Posts

### Database Optimizations

- **Indexes** are implemented on foreign keys and frequently queried fields 
  - For example, in Follow entity, both follower and following IDs are indexed
- **Unique constraints** prevent duplicate data (e.g., one user can't like a post twice)
- **Cascade operations** ensure referential integrity (e.g., deleting a post removes its likes)

## API Design

### RESTful Endpoints Structure

The API follows standard RESTful conventions with the following main resource endpoints:

1. **Users API**
   - `GET /api/users` - Get all users
   - `GET /api/users/:id` - Get user by ID
   - `POST /api/users` - Create new user
   - `PUT /api/users/:id` - Update user
   - `DELETE /api/users/:id` - Delete user
   - `GET /api/users/:id/followers` - Get user's followers
   - `GET /api/users/:id/activity` - Get user's activity feed

2. **Posts API**
   - `GET /api/posts` - Get all posts
   - `GET /api/posts/:id` - Get post by ID
   - `POST /api/posts` - Create new post
   - `PUT /api/posts/:id` - Update post
   - `DELETE /api/posts/:id` - Delete post
   - `GET /api/posts/hashtag/:tag` - Get posts by hashtag

3. **Likes API**
   - `GET /api/likes` - Get all likes
   - `GET /api/likes/:id` - Get like by ID
   - `POST /api/likes` - Create new like
   - `DELETE /api/likes/:id` - Delete like

4. **Follows API**
   - `GET /api/follows` - Get all follows
   - `GET /api/follows/:id` - Get follow by ID
   - `POST /api/follows` - Create new follow
   - `DELETE /api/follows/:id` - Delete follow

5. **Hashtags API**
   - `GET /api/hashtags` - Get all hashtags
   - `GET /api/hashtags/:id` - Get hashtag by ID
   - `POST /api/hashtags` - Create new hashtag
   - `PUT /api/hashtags/:id` - Update hashtag
   - `DELETE /api/hashtags/:id` - Delete hashtag
   - `GET /api/hashtags/search` - Search hashtags
   - `GET /api/hashtags/popular` - Get popular hashtags

6. **Feed API**
   - `GET /api/feed` - Get personalized feed for current user

### Authentication

The API implements a simplified authentication system for demonstration purposes:

- The `authMiddleware` extracts a `userId` from request headers
- For a production application, a proper authentication mechanism (JWT or session-based) would be implemented

### Request Validation

- Input validation is implemented using **Joi** schemas
- Validation rules are defined for each entity in separate files (e.g., `user.validation.ts`)
- The `validate` middleware applies the schemas to incoming requests

## Component Design

### Controllers

Controllers handle HTTP requests and responses, implementing the business logic for each entity:

1. **UserController**
   - Manages user CRUD operations
   - Provides specialized endpoints for followers and activity feeds

2. **PostController**
   - Manages post CRUD operations
   - Implements hashtag association and search functionality

3. **LikeController**
   - Manages the creation and deletion of likes
   - Updates post like counts when likes are created/deleted

4. **FollowController**
   - Manages user follow relationships
   - Contains checks to prevent self-follows and duplicate follows

5. **HashtagController**
   - Manages hashtag CRUD operations
   - Provides search and popularity tracking features

6. **FeedController**
   - Implements personalized content delivery
   - Aggregates posts from followed users in chronological order

### Data Access

- TypeORM repositories are used to interact with the database
- Query builders are employed for more complex queries
- Pagination is implemented for list endpoints

## Key Features

### Post Creation with Hashtags

- Users can create posts with content and optional hashtags
- The system automatically creates new hashtags or links to existing ones
- Hashtags are stored in a separate entity with many-to-many relationship to posts

### User Following System

- Users can follow other users (but not themselves)
- The follow relationship is tracked in a dedicated entity
- The system prevents duplicate follows

### Personalized Feed

- Users receive personalized feeds based on who they follow
- The feed is ordered by post creation date (newest first)
- Pagination is implemented to handle large feeds efficiently

### Activity Tracking

- User activities (posts, likes, follows) are tracked
- An activity feed can be retrieved for any user
- Activities can be filtered by type and date range

### Hashtag Discovery

- Popular hashtags can be discovered through a dedicated endpoint
- Hashtags can be searched with partial matching
- Posts can be filtered by hashtag

## Error Handling

- Controllers use try-catch blocks for robust error handling
- Appropriate HTTP status codes are returned for different error conditions
- Error messages are descriptive and user-friendly

## Performance Considerations

- Database indexes are defined on frequently queried fields
- Pagination is implemented on list endpoints to limit data transfer
- Query optimizations are applied for complex operations (e.g., feed generation)

## Security Considerations

- Input validation prevents malformed data
- Authentication middleware secures endpoints
- Authorization checks ensure users can only modify their own resources

## Scalability

The current architecture can be scaled in several ways:

1. **Horizontal Scaling**
   - Multiple application instances behind a load balancer
   - Database replication for read operations

2. **Caching**
   - Implement Redis caching for popular feeds and queries
   - Cache frequently accessed hashtags and user data

3. **Database Optimizations**
   - Further index tuning based on query patterns
   - Consider NoSQL solutions for feed generation at extreme scale

## Future Enhancements

1. **Notification System**
   - Real-time notifications for likes, follows, and mentions

2. **Comment System**
   - Allow users to comment on posts
   - Support nested comments and replies

3. **Media Support**
   - Add support for images and videos in posts
   - Implement media storage and CDN integration

4. **Advanced Feed Algorithms**
   - Implement relevance-based feed ranking
   - Add content recommendation features

5. **Proper Authentication**
   - Implement JWT-based authentication
   - Add refresh token mechanism
   - Support OAuth providers

## Conclusion

The Social Media Platform API provides a solid foundation for a social networking application with core features like user management, content creation, social interactions, and personalized content delivery. The modular architecture allows for easy maintenance and future extensions.