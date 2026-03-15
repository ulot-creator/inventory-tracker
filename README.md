# 📊 Inventory Tracker & Business Analytics

A premium, full-stack inventory management system designed for modern businesses. Track your stock, monitor performance with real-time analytics, and stay ahead with automated low-stock alerts.

---

## ✨ Key Features

- **🚀 Real-time Dashboard**: Get a birds-eye view of your total stock, warehouse value, and critical alerts at a glance.
- **📦 Intelligent Item Management**: Easily add, edit, and organize inventory items with detailed metadata.
- **⚠️ Low-Stock Detection**: Never run out of stock again with automated system-wide alerts for items hitting critical levels.
- **🎨 Premium UI/UX**: A sleek, modern interface built with dark mode and glassmorphism aesthetics.
- **📈 Business Analytics**: Track movement patterns and inventory health to make data-driven decisions.
- **🔔 Notification Center**: Stay updated with a dedicated space for all inventory-related system messages.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (React, TypeScript, Tailwind CSS) |
| **Backend** | [NestJS](https://nestjs.com/) (Node.js, TypeScript) |
| **Database** | [SQLite](https://www.sqlite.org/) (via TypeORM) |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd inventory-tracker
```

### 2. Setup & Run the Backend
The backend handles the business logic and SQLite database.
```bash
cd backend
npm install
npm run start:dev
```
*The backend will be running at [http://localhost:4000](http://localhost:4000)*

### 3. Setup & Run the Frontend
The frontend provides the sleek user interface.
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.*

---

## 💡 How to Use Effectively

1. **Monitor the Dashboard**: Check your "Low Stock" widget daily to prioritize reordering.
2. **Detailed Cataloging**: When adding items, include categories and descriptions to make searching and filtering more powerful.
3. **Use the Sidebar**: Quickly navigate between "Items" for management and "Settings" for system configuration.
4. **Respond to Alerts**: Click on notification icons to jump directly to items that need attention.

---

## 🏗️ Project Structure

```
inventory-tracker/
├── frontend/          # Next.js Application
├── backend/           # NestJS API
├── README.md          # Project documentation (this file)
└── assets/            # Project screenshots and media
```

---

## 📄 License

This project is licensed under the MIT License.
