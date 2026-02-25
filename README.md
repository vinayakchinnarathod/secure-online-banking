# 🏦 Secure Online Banking System

A production‑ready **full‑stack banking application** built with security as the top priority. This system demonstrates enterprise‑grade authentication, KYC verification workflow, and admin‑controlled account activation.

---

## 🚀 Project Overview

This project simulates a real‑world digital banking platform where users can securely register, submit KYC documents, and receive account approval only after admin verification. It is designed following modern backend architecture and secure coding practices.

---

## 🔐 Key Features

* Secure user registration and login
* Argon2id password hashing (bank‑grade security)
* Admin‑verified KYC system
* Account creation only after approval
* Role‑based access control (Admin/User)
* REST API architecture
* Transaction management module
* Loan request system
* Checkbook request system
* MySQL relational database design

---

## 🧠 Security Highlights

This system is built with strong security principles:

* Password hashing using **Argon2id**
* No plaintext password storage
* Protected admin routes
* Input validation
* Layered architecture (Controller → Service → Repository)
* Secure database schema design

---

## 🛠 Tech Stack

**Backend**

* Java
* Spring Boot
* Spring Data JPA
* MySQL

**Frontend**

* React.js
* HTML5
* CSS3
* JavaScript

**Security**

* Argon2 Encryption
* Role‑based Authorization

---

## 📂 Project Structure

```
secure-online-banking
 ┣ backend
 ┃ ┣ controller
 ┃ ┣ service
 ┃ ┣ repository
 ┃ ┗ model
 ┣ frontend
 ┃ ┣ components
 ┃ ┣ pages
 ┃ ┗ styles
 ┗ database
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/yourusername/secure-online-banking.git
cd secure-online-banking
```

---

### 2️⃣ Backend Setup

```
cd backend
mvn spring-boot:run
```

Configure database in:

```
src/main/resources/application.properties
```

---

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm start
```

---

### 4️⃣ Database Setup

Run SQL scripts inside:

```
database/schema.sql
```

---

## 🔑 User Roles

| Role  | Permissions                                       |
| ----- | ------------------------------------------------- |
| Admin | Verify KYC, approve/reject accounts               |
| User  | Register, login, submit KYC, use banking services |

---

## 📡 API Modules

* Authentication API
* KYC Submission API
* Admin Verification API
* Transactions API
* Loan API
* Checkbook API

---

## 📊 System Workflow

```
User Register → Password Encrypted → Login
         ↓
Submit KYC
         ↓
Admin Verification
         ↓
Account Activated
         ↓
Access Banking Services
```

---

## 🎯 Project Goals

This project demonstrates:

* Secure system design
* Enterprise backend architecture
* Authentication best practices
* Real banking workflow simulation
* Production‑ready coding standards

---

## 📌 Future Improvements

Planned upgrades:

* JWT authentication
* Email OTP verification
* Two‑factor authentication
* Fraud detection system
* Transaction analytics dashboard
* Microservices architecture

---

## 👨‍💻 Author

**Vinayak Chinnarathod**

---

## 📜 License

This project is for educational and demonstration purposes.

---

## ⭐ Support

If you like this project:

* Star the repository
* Fork it
* Contribute improvements

---

**Built with focus on Security • Scalability • Real‑world Architecture**
