# DevTasker - Task & Project Manager for Developers

A comprehensive task and project management application designed specifically for developers and engineering teams. Built with React, Next.js, TypeScript, and Firebase.

## 🚀 Features

### MVP Features (Phase 1)
- ✅ **User Authentication** - Firebase Auth integration with email/password
- ✅ **Project Management** - Create, edit, and manage projects
- ✅ **Kanban Boards** - Drag-and-drop task management with customizable columns
- ✅ **Task Management** - Create, assign, and track tasks with priorities and types
- ✅ **Team Collaboration** - User roles and team management
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Dark Mode Support** - Toggle between light and dark themes

### Planned Features (Phase 2)
- 🔄 **Sprint Planning** - Agile sprint management with velocity tracking
- 🔄 **Time Tracking** - Manual and timer-based time logging
- 🔄 **GitHub Integration** - Connect with repositories and track commits
- 🔄 **Reporting & Analytics** - Project insights and team performance metrics
- 🔄 **Client Portal** - Dedicated view for clients and stakeholders
- 🔄 **Automation** - Workflow automation and notifications

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Zustand** - State management
- **React Hot Toast** - Notifications

### Backend & Database
- **Firebase Authentication** - User management
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Hosting** - Deployment

### UI Components
- **Lucide React** - Icon library
- **@dnd-kit** - Drag and drop functionality
- **React Query** - Data fetching and caching

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd devtasker
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Enable Storage
5. Get your Firebase configuration

### 4. Environment Configuration

Copy the environment example file and update with your Firebase config:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Firestore Security Rules

Set up the following Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Team members can read/write team data
    match /teams/{teamId} {
      allow read, write: if request.auth != null && 
        resource.data.members.hasAny([request.auth.uid]);
    }
    
    // Project members can read/write project data
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        resource.data.members.hasAny([request.auth.uid]);
    }
    
    // Task management based on project membership
    match /tasks/{taskId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.members.hasAny([request.auth.uid]);
    }
  }
}
```

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
devtasker/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── dashboard/         # Dashboard page
│   │   ├── projects/          # Project pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── kanban/            # Kanban board components
│   │   └── Layout.tsx         # Main layout component
│   ├── lib/                   # Utility libraries
│   │   └── firebase.ts        # Firebase configuration
│   ├── store/                 # Zustand stores
│   │   ├── auth.ts            # Authentication store
│   │   └── project.ts         # Project management store
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # Main types file
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── .env.example              # Environment template
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🎯 Usage

### Creating Your First Project

1. Sign up or log in to your account
2. Click "New Project" on the dashboard
3. Fill in project details and invite team members
4. Start creating tasks on your Kanban board

### Managing Tasks

1. Navigate to your project board
2. Click "Add Task" to create new tasks
3. Drag and drop tasks between columns
4. Click on tasks to view details and add comments
5. Assign tasks to team members and set priorities

### Team Collaboration

1. Invite team members via email
2. Assign different roles (Admin, PM, Developer, Client)
3. Use @mentions in task comments
4. Track project progress with real-time updates

## 🚀 Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on each push

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛣 Roadmap

### Phase 1 - MVP ✅
- [x] Authentication system
- [x] Basic project management
- [x] Kanban boards
- [x] Task management
- [x] Team collaboration

### Phase 2 - Enhanced Features 🔄
- [ ] Sprint planning and management
- [ ] Time tracking with reports
- [ ] GitHub/GitLab integration
- [ ] Advanced reporting and analytics
- [ ] Client portal
- [ ] Workflow automation

### Phase 3 - Advanced Features 📋
- [ ] Mobile app (React Native)
- [ ] API integrations (Slack, Discord)
- [ ] Advanced permissions
- [ ] Custom fields and workflows
- [ ] Enterprise features

## 💬 Support

If you have any questions or need help, please:
1. Check the [documentation](docs/)
2. Open an [issue](https://github.com/your-repo/devtasker/issues)
3. Contact support at support@devtasker.app

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for beautiful icons
- [dnd kit](https://dndkit.com/) for drag and drop functionality

---

Made with ❤️ for developers, by developers.
