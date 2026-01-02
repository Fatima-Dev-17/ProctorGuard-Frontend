# ProctorGuard Frontend

Beautiful, modern React TypeScript frontend for the ProctorGuard online examination proctoring system.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API endpoint** - Edit `src/utils/config.ts`:
   ```typescript
   export const API_BASE_URL = 'http://YOUR_EC2_PUBLIC_IP:8080';
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

## 📋 Current Features (Completed)

✅ Home Page with animations
✅ Login Page with session management
✅ Signup Page with password strength indicator
✅ Dark theme UI
✅ API integration with backend
✅ Protected routes
✅ Role-based access control

## 🎨 Design System

- **Primary Color**: Indigo (`#6366f1`)
- **Background**: Deep dark (`#0a0e27`)
- **Gradient**: Purple to Indigo
- **Typography**: System fonts for performance
- **Animations**: Smooth fade-in and slide-in effects

## 🔐 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

## 🌐 Connecting to Backend

Your C++ backend should be running on AWS EC2 on port 8080. Update the API URL in `src/utils/config.ts` with your EC2 public IP address.

## 📞 What's Next?

Run `npm start` to see the beautiful UI! The Home, Login, and Signup pages are fully functional and ready to connect to your backend.

Next, we'll build:
- Teacher Dashboard
- Student Dashboard
- Course Management
- Evaluation Screens
- Real-time Monitoring

---

Made with ❤️ for ProctorGuard
# ProctorGuard-Frontend
