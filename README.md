
---

### **Backend Devden**  
```markdown
# Devden Backend  

The backend of Devden provides secure and scalable APIs for user authentication, event management, real-time communication, and payment processing. It integrates third-party services for video calls, payment handling, and notifications to ensure a rich and seamless user experience.  

## Key Features  

- **Event Hosting & Ticketing**  
  - API endpoints to host and manage events.  
  - QR code-based ticketing system.  
  - Refund and cancellation management.  

- **Admin Dashboard**  
  - Manage user accounts, review event reports, and moderate comments.  
  - Approve or reject events and monitor ticket sales with commission tracking.  

- **Real-Time Chat & Video Calls**  
  - Chat functionality with text, audio, video, and image messaging.  
  - Integrated video calls using ZEGOCLOUD.  

- **Secure Payments**  
  - Payment processing and wallet withdrawals with Stripe.  
  - Refund and commission management.  

- **Notifications**  
  - Email notifications using Nodemailer.  

## Tech Stack  

- **Backend Framework**: Node.js + Express  
- **Database**: MongoDB  
- **Authentication**: Google OAuth, JWT  
- **Real-Time Data**: Socket.io  
- **Payments**: Stripe  
- **Video Calls**: ZEGOCLOUD  
- **Storage**: AWS, Cloudinary  

## Growth & Future Vision  

- Extend API to support map-based event discovery.  
- Enable user-created communities and free event registrations.  

## Setup  

1. Clone the repository:  
   ```bash  
   git clone https://lnkd.in/gKK9pu7D  
   cd devden-backend  

2. Install Dependencies :  
   ```bash  
   npm install

3. Set up env:  
   ```bash  
   Create a .env and configure

4. Start the server:  
   ```bash  
   npm start
