# 🍽️ Restaurant Order Tracker System

A real-time restaurant order tracking and table management system built using **Node.js**, **Express**, **MongoDB**, and **EJS**. This app streamlines staff and owner interaction, making food service more efficient and trackable.

---

## 🚀 Features

### 👑 Owner Dashboard
- Add and manage restaurant tables dynamically
- View live table status updates (empty, taking, waiting, delivered)
- Pop-up view of ordered food with a detailed bill

### 👨‍🍳 Staff Dashboard
- Login using email
- Claim empty tables and take orders via interactive menu
- Select dishes by category and update order quantities
- Switch between "Order Taking" and "Order Taken" views

### 📋 Order Management
- Status-based table card glow (gray, orange, green, red)
- Timer auto-starts when order is placed
- If waiting > 20 mins, card glows red
- Orders stored with dish number and quantity

### 🧾 Bill Generation
- Auto-calculated bill with dish names, quantities, and total price
- Smooth pop-up view with scrolling and responsive layout

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript, EJS Templates
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** Express Sessions (staff login)

---

## 📸 Screenshots

> *(Add screenshots or GIFs of dashboard, table UI, food pop-up, bill view, etc.)*

---

## 📦 Setup Instructions

```bash
git clone https://github.com/lakshya-sunkara/restaurant-order-tracker-system
cd restaurant-order-tracker-system
npm install
npm start
