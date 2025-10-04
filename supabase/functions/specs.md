# Supabase Edge Functions Specifications

## Overview
This document outlines the specifications and contracts for Supabase Edge Functions used in the AMAA TMR application.

## Function Architecture

### Authentication & Authorization
- All functions require valid JWT tokens
- User context is extracted from the JWT token
- Team-based access control is enforced

### Error Handling
- Standardized error response format
- Proper HTTP status codes
- Detailed error messages for debugging

## Edge Functions

### 1. Survey Submission Function
**Endpoint:** `/functions/v1/submit-survey`
**Method:** POST
**Authentication:** Required

#### Request Body
```json
{
  "communication_rating": 4,
  "collaboration_rating": 3,
  "leadership_rating": 5,
  "comments": "Great team communication overall",
  "team_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "survey_id": "uuid",
    "submitted_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid rating value",
    "details": "Rating must be between 1 and 5"
  }
}
```

### 2. Insights Retrieval Function
**Endpoint:** `/functions/v1/get-insights`
**Method:** GET
**Authentication:** Required

#### Query Parameters
- `team_id` (optional): Filter insights by team
- `period` (optional): Time period for insights (default: "1month")

#### Response
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "metric_name": "communication_score",
        "metric_value": 4.2,
        "metric_trend": "positive",
        "period_start": "2024-01-01",
        "period_end": "2024-01-31"
      },
      {
        "metric_name": "collaboration_score",
        "metric_value": 3.8,
        "metric_trend": "neutral",
        "period_start": "2024-01-01",
        "period_end": "2024-01-31"
      },
      {
        "metric_name": "leadership_score",
        "metric_value": 4.5,
        "metric_trend": "positive",
        "period_start": "2024-01-01",
        "period_end": "2024-01-31"
      }
    ],
    "summary": {
      "total_surveys": 25,
      "response_rate": 0.85,
      "last_updated": "2024-01-31T12:00:00Z"
    }
  }
}
```

### 3. Team Management Function
**Endpoint:** `/functions/v1/team-management`
**Method:** POST
**Authentication:** Required (Admin only)

#### Request Body
```json
{
  "action": "create_team",
  "name": "New Team",
  "description": "Team description",
  "members": [1, 2, 3]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "team_id": "uuid",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

### 4. Analytics Function
**Endpoint:** `/functions/v1/analytics`
**Method:** GET
**Authentication:** Required

#### Query Parameters
- `team_id`: Team identifier
- `metric`: Specific metric to analyze
- `granularity`: Data granularity (day, week, month)

#### Response
```json
{
  "success": true,
  "data": {
    "analytics": [
      {
        "date": "2024-01-01",
        "communication_score": 4.0,
        "collaboration_score": 3.5,
        "leadership_score": 4.2
      },
      {
        "date": "2024-01-02",
        "communication_score": 4.2,
        "collaboration_score": 3.8,
        "leadership_score": 4.3
      }
    ],
    "trends": {
      "communication_trend": "improving",
      "collaboration_trend": "stable",
      "leadership_trend": "improving"
    }
  }
}
```

## Database Functions

### 1. Calculate Team Insights
**Function:** `calculate_team_insights(team_uuid UUID)`
**Returns:** Table with metric data
**Purpose:** Calculate insights for a specific team

### 2. Get Survey Statistics
**Function:** `get_survey_statistics(team_uuid UUID, period_start DATE, period_end DATE)`
**Returns:** Survey statistics for a team in a given period
**Purpose:** Provide statistical data for analytics

### 3. Update Team Insights
**Function:** `update_team_insights(team_uuid UUID)`
**Returns:** Boolean success indicator
**Purpose:** Recalculate and update team insights

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce team-based access control
- Users can only access data from teams they belong to

### API Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user
- Burst allowance for legitimate usage

### Data Validation
- Input validation on all endpoints
- SQL injection prevention
- XSS protection in responses

## Performance Requirements

### Response Times
- Survey submission: < 500ms
- Insights retrieval: < 1s
- Analytics queries: < 2s

### Caching Strategy
- Insights cached for 5 minutes
- Team data cached for 1 hour
- User permissions cached for 30 minutes

## Monitoring & Logging

### Metrics to Track
- Function execution time
- Error rates
- Database query performance
- User activity patterns

### Logging Requirements
- All function calls logged
- Error details captured
- Performance metrics recorded
- Security events flagged

## Deployment

### Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Service role key
- `JWT_SECRET`: JWT signing secret
- `DATABASE_URL`: Database connection string

### Health Checks
- Database connectivity
- Function availability
- Authentication service status
- External API dependencies

## Testing

### Unit Tests
- Function logic testing
- Database function testing
- Error handling validation

### Integration Tests
- End-to-end workflow testing
- Authentication flow testing
- Performance testing

### Load Testing
- Concurrent user simulation
- Database load testing
- API rate limit testing
