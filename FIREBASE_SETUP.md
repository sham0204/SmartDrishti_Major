# Firebase Setup for SmartDrishti ESP32 Integration

## 1. Firebase Project Creation

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "SmartDrishti-IoT")
4. Disable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Realtime Database

1. In the Firebase Console, click "Realtime Database" from the left sidebar
2. Click "Create Database"
3. Choose "Start in test mode" (you can change rules later)
4. Select a region close to you
5. Click "Enable"

## 3. Get Firebase Configuration

### DATABASE_URL
1. In the Firebase Console, go to "Realtime Database"
2. Copy the database URL from the top of the database section
3. It will look like: `https://your-project-id-default-rtdb.firebaseio.com/`

### DATABASE_SECRET (Legacy Token)
1. In the Firebase Console, go to the gear icon (Project settings)
2. Click on "Service accounts" tab
3. Scroll down to "Database secrets" section
4. Click "Show" next to the secret
5. Copy the database secret

Note: Database secrets are legacy credentials. For production, use service accounts instead.

## 4. Firebase Realtime Database Rules

Replace the default rules with these more secure rules:

```json
{
  "rules": {
    "devices": {
      "$device_id": {
        "commands": {
          ".read": "auth != null",
          ".write": "auth != null",
          "$command_id": {
            ".validate": "newData.hasChildren(['command', 'timestamp', 'userId'])"
          }
        },
        "state": {
          ".read": "auth != null",
          ".write": "auth != null || newData.child('timestamp').val() > now - 10000"
        }
      }
    }
  }
}
```

These rules ensure:
- Only authenticated users can read/write commands
- Device state can be updated by authenticated users or devices (with recent timestamp)

## 5. Service Account for Admin SDK

For the Next.js backend to securely communicate with Firebase:

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Convert the JSON content to a single-line string for environment variables

## 6. Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}

# For development only (use service account in production)
FIREBASE_DATABASE_SECRET=your-database-secret
```

## 7. Database Structure

The Firebase Realtime Database will use this structure:

```
/devices
  /esp32_01
    /commands
      -LYbXmZJQk3RzPjAqVqA: {
          "command": "LED1_ON",
          "timestamp": 1623456789000,
          "userId": 1
        }
      -LYbXn5RzPjAqVqB2cB2: {
          "command": "LED1_BLINK:1000",
          "timestamp": 1623456795000,
          "userId": 1
        }
    /state: {
        "led1": true,
        "led2": false,
        "fan": false,
        "timestamp": 1623456795500
      }
```

## 8. Security Recommendations

1. For production, always use service accounts instead of database secrets
2. Implement proper user authentication
3. Restrict database rules to specific user permissions
4. Regularly rotate credentials
5. Monitor Firebase usage in the console