# Production Deployment Guide

## Environment Setup

1. Set up a PostgreSQL database
2. Configure environment variables in `.env.production`:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database_name?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-here"
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   PORT=3000
   NODE_ENV="production"
   ```

## Database Migration

Run the following command to apply database migrations:
```bash
npm run prisma:migrate:prod
```

## Build and Deploy

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the production server:
   ```bash
   npm run start:prod
   ```

## Process Management

For production deployments, use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name smartdrishti
```

## Reverse Proxy Configuration

Configure Nginx or Apache as a reverse proxy to handle SSL termination and static file serving.

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```