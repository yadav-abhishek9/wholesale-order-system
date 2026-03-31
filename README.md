# Wholesale Order Management System

A complete, production-ready wholesale order management system built with React, Node.js, Express, and MongoDB.

## Features

### Admin Features
- **Dashboard**: View total sales, orders, parties, products with interactive charts
- **Product Management**: Add, edit, delete products with base pricing
- **Party Management**: Manage customer parties with contact details
- **Party-Wise Pricing**: Set custom prices per party, copy pricing between parties
- **Order Management**: View all orders with advanced filters
- **Payment Tracking**: Monitor received and pending amounts

### Salesman Features
- **Party Search**: Quick search functionality to find parties
- **Take Orders**: Select products with party-specific pricing
- **Order History**: View all submitted orders
- **Payment Collection**: Record received payments at order time

### Technical Features
- JWT-based authentication
- Role-based access control (Admin/Salesman)
- Fully responsive design (mobile, tablet, desktop)
- Real-time order calculations
- WhatsApp integration for order notifications
- RESTful API architecture

## Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for responsive design
- React Router DOM for navigation
- Axios for API calls
- Chart.js for analytics visualization
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wholesale-orders
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_WHATSAPP_NUMBER=+919999999999
```

5. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` if needed:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

To create a production build of the frontend:
```bash
cd frontend
npm run build
```

The build files will be in the `dist` directory.

## Database Setup

The application will automatically connect to MongoDB. Make sure MongoDB is running on your system.

To create initial admin and salesman users, you can use the registration endpoint or MongoDB directly:

```javascript
// Example: Create admin user via API
POST http://localhost:5000/api/auth/register
{
  "name": "Admin User",
  "email": "admin@demo.com",
  "password": "admin123",
  "role": "admin",
  "phone": "1234567890"
}

// Example: Create salesman user
POST http://localhost:5000/api/auth/register
{
  "name": "Sales Person",
  "email": "sales@demo.com",
  "password": "sales123",
  "role": "salesman",
  "phone": "0987654321"
}
```

## Default Login Credentials

After creating users, you can login with:

**Admin:**
- Email: admin@demo.com
- Password: admin123

**Salesman:**
- Email: sales@demo.com
- Password: sales123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Parties
- `GET /api/parties` - Get all parties (with search)
- `POST /api/parties` - Create party (Admin)
- `PUT /api/parties/:id` - Update party (Admin)
- `DELETE /api/parties/:id` - Delete party (Admin)

### Party Pricing
- `GET /api/party-prices/:partyId` - Get party-specific prices
- `POST /api/party-prices/set` - Set party prices (Admin)
- `POST /api/party-prices/copy` - Copy prices between parties (Admin)

### Orders
- `GET /api/orders` - Get all orders (with filters)
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/stats/dashboard` - Get dashboard stats (Admin)
- `GET /api/orders/stats/chart` - Get chart data (Admin)

## Project Structure

```
wholesale-order-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── partyController.js
│   │   ├── partyPriceController.js
│   │   └── productController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Order.js
│   │   ├── Party.js
│   │   ├── PartyPrice.js
│   │   ├── Payment.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── partyPriceRoutes.js
│   │   ├── partyRoutes.js
│   │   └── productRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   ├── Parties.jsx
│   │   │   │   ├── PartyPricing.jsx
│   │   │   │   └── Products.jsx
│   │   │   ├── salesman/
│   │   │   │   ├── Orders.jsx
│   │   │   │   ├── Parties.jsx
│   │   │   │   └── TakeOrder.jsx
│   │   │   └── Login.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

Key responsive features:
- Collapsible sidebar on mobile
- Responsive tables with horizontal scroll
- Adaptive card layouts
- Touch-friendly buttons and inputs
- Mobile-optimized forms

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes on both frontend and backend
- Role-based access control
- Input validation
- CORS configuration

## WhatsApp Integration

Orders trigger WhatsApp notifications to admin. To configure:

1. Set `ADMIN_WHATSAPP_NUMBER` in backend `.env`
2. For production, integrate with WhatsApp Business API or services like Twilio

Current implementation logs messages to console. Replace with actual API integration as needed.

## Contributing

This is a production-ready application. Feel free to customize based on your business needs.

## License

MIT License - feel free to use this project for commercial or personal use.

## Support

For issues or questions, please create an issue in the repository.
"# wholesale-order-system" 
