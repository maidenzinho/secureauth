# API Documentation

## Authentication

### Register
`POST /api/auth/register`

Body:
```
{
  "email": "user@example.com",
  "password": "senhaSegura123"
}
```

Verify Email

GET /api/auth/verify-email?token=<verification_token>
Login
POST /api/auth/login

Body:
```

{
  "email": "user@example.com",
  "password": "senhaSegura123",
  "location": {
    "latitude": -23.5505,
    "longitude": -46.6333
  }
}
```

Two-Factor Authentication

POST /api/auth/enable-2fa (Requires authentication)
POST /api/auth/verify-2fa

Body:
```

{
  "token": "123456"
}
```

Biometric Authentication

POST /api/auth/verify-biometric

Body:
```
{
  "biometricData": "<hashed_biometric_data>"
}
```

Google OAuth

GET /api/auth/google
GET /api/auth/google/callback

# Security Practices

## Recommended Security Measures

1. **Environment Variables**: Never commit sensitive data to version control.
2. **Rate Limiting**: Implemented to prevent brute force attacks.
3. **HTTPS**: Always use HTTPS in production.
4. **CORS**: Configured to allow only trusted origins.
5. **Password Hashing**: Uses bcrypt with salt rounds.
6. **JWT**: Tokens have expiration and are signed with strong secret.

## Security Headers

The application uses Helmet.js to set secure HTTP headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (in production)

docs/DEPLOY.md:
markdown

# Deployment Guide

## Prerequisites
- Node.js 16+
- MongoDB Atlas or self-hosted MongoDB
- PM2 or similar process manager (recommended)

## Steps

1. Set up environment variables in production:
```
export MONGODB_URI="your_production_mongodb_uri"
export JWT_SECRET="strong_secret_key"
export JWT_VERIFICATION_SECRET="another_strong_secret"
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"
export CLIENT_URL="https://yourfrontend.com"
```

### Install dependencies:
```
npm install --production
```

### Start the server:
```
npm start
```

Using PM2
```
npm install -g pm2
pm2 start src/app.js --name secureauth
pm2 save
pm2 startup
```

NGINX Configuration (example)
```
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```
## 8. Arquivos de Configuração
# MongoDB
MONGODB_URI=mongodb://localhost:27017/secureauth

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_VERIFICATION_SECRET=your_verification_secret_key

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application
PORT=3000
BASE_URL=http://localhost:3000
CLIENT_URL=http://localhost:8080

# Email (for production)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your_email_password
```