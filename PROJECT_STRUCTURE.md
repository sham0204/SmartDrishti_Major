# SmartDrishti ESP32 + Firebase Project Structure

## Folder Structure

```
SmartDrishti/
├── app/
│   ├── api/
│   │   └── device/
│   │       └── send-command/
│   │           └── route.js          # API endpoint for sending commands to ESP32
│   └── projects/
│       └── esp32/
│           └── page.js               # ESP32 control page
├── components/
│   └── ui/
│       └── Esp32Controller.js        # React component for ESP32 control
├── esp32/
│   └── esp32_firebase.ino            # ESP32 Arduino sketch
├── firebase/
│   └── rules.json                    # Firebase Realtime Database rules
├── lib/
│   ├── auth.js                       # Authentication utilities (existing)
│   ├── firebaseAdmin.js              # Firebase Admin SDK initialization
│   ├── firebaseClient.js             # Firebase Client SDK initialization
│   └── prisma.js                     # Prisma client (existing)
├── prisma/
│   ├── schema.prisma                 # Database schema (existing)
│   └── seed.js                       # Database seeding (existing)
├── .env.example                      # Environment variables example
├── ESP32_SETUP.md                    # ESP32 setup guide
├── FIREBASE_SETUP.md                 # Firebase setup guide
├── PROJECT_STRUCTURE.md              # This file
└── package.json                      # Project dependencies and scripts
```

## File Descriptions

### Backend Files

1. **[lib/firebaseAdmin.js](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/lib/firebaseAdmin.js)** - Initializes Firebase Admin SDK for server-side operations
2. **[app/api/device/send-command/route.js](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/app/api/device/send-command/route.js)** - API endpoint for sending commands to ESP32 devices
3. **[lib/firebaseClient.js](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/lib/firebaseClient.js)** - Initializes Firebase Client SDK for frontend operations

### Frontend Files

1. **[components/ui/Esp32Controller.js](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/components/ui/Esp32Controller.js)** - React component for controlling ESP32 devices
2. **[app/projects/esp32/page.js](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/app/projects/esp32/page.js)** - Page that displays the ESP32 controller

### Hardware Files

1. **[esp32/esp32_firebase.ino](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/esp32/esp32_firebase.ino)** - Arduino sketch for ESP32 that communicates with Firebase

### Documentation Files

1. **[FIREBASE_SETUP.md](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/FIREBASE_SETUP.md)** - Guide for setting up Firebase Realtime Database
2. **[ESP32_SETUP.md](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/ESP32_SETUP.md)** - Guide for setting up ESP32 with Arduino IDE
3. **[PROJECT_STRUCTURE.md](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/PROJECT_STRUCTURE.md)** - This file
4. **[firebase/rules.json](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/firebase/rules.json)** - Firebase Realtime Database security rules

### Configuration Files

1. **[.env.example](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/.env.example)** - Example environment variables
2. **[package.json](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/package.json)** - Project dependencies and scripts

## Data Flow

1. **User Interface**: User interacts with buttons on the ESP32 control page
2. **Frontend**: Esp32Controller component sends commands to the Next.js API endpoint
3. **API Endpoint**: [route.js](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/app/api/device/send-command/route.js) writes commands to Firebase Realtime Database
4. **Firebase**: Stores commands in `/devices/{deviceId}/commands`
5. **ESP32**: Continuously listens for new commands in Firebase and executes them
6. **ESP32**: Updates device state in Firebase at `/devices/{deviceId}/state`
7. **Frontend**: Listens for state changes in Firebase and updates the UI in real-time

## Environment Variables Required

Add these to your `.env` file:

```env
# Existing variables
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
FIREBASE_DATABASE_SECRET=your-database-secret

# For frontend Firebase client
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
```

## Installation Steps

1. Install new dependencies:
   ```bash
   npm install firebase-admin
   ```

2. Set up Firebase:
   - Follow [FIREBASE_SETUP.md](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/FIREBASE_SETUP.md) to create a Firebase project and configure Realtime Database
   - Update environment variables in `.env`

3. Set up ESP32:
   - Follow [ESP32_SETUP.md](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/ESP32_SETUP.md) to install Arduino IDE and required libraries
   - Update [esp32_firebase.ino](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/esp32/esp32_firebase.ino) with your Firebase configuration
   - Upload sketch to ESP32

4. Run the application:
   ```bash
   npm run dev
   ```

5. Access the ESP32 control page at:
   ```
   http://localhost:3000/projects/esp32
   ```