# Rentiful – Scalable Real Estate Rental Platform

Build a Scalable Real Estate Application with **Next.js**, **Node.js**, and **AWS**.  
This project demonstrates how to create an enterprise-grade Rental Apartment Application using a modern, cloud-native stack.

---

## 🚀 Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) (App Router, SSR/SSG)
- [Redux Toolkit](https://redux-toolkit.js.org/) (state management)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first styling)
- [Shadcn UI](https://ui.shadcn.com/) (component library)
- [TypeScript](https://www.typescriptlang.org/) (type safety)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (forms & validation)

**Backend**
- [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) (REST API)
- [Prisma ORM](https://www.prisma.io/) (type-safe DB access)
- [PostgreSQL](https://www.postgresql.org/) (RDS)
- [AWS EC2](https://aws.amazon.com/ec2/) (compute), [API Gateway](https://aws.amazon.com/api-gateway/) (routing)
- [AWS S3](https://aws.amazon.com/s3/) (file storage)
- [AWS Amplify](https://aws.amazon.com/amplify/) (cloud integration)

**Authentication**
- [AWS Cognito](https://aws.amazon.com/cognito/) (secure, scalable user auth)

---

## 🏗️ Project Overview

Rentiful is a full-featured property rental platform designed for scalability, security, and a seamless user experience.  
It supports property listings, applications, lease management, payments, and robust authentication for both tenants and managers.

**Key Features:**
- Modern, responsive UI with advanced search and filtering
- Secure authentication and role-based access (tenant/manager)
- Cloud file uploads (property images to S3)
- Real-time form validation and smooth user flows
- Enterprise-grade backend with RESTful APIs and PostgreSQL
- Cloud-native deployment and infrastructure

---

## 📁 Monorepo Structure

```
client/   # Next.js frontend (TypeScript, Tailwind, Redux)
server/   # Node.js/Express backend (TypeScript, Prisma, AWS SDK)
```

---

## 🛠️ Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RentifulProject.git
   cd RentifulProject
   ```

2. **Configure environment variables**
   See the [Environment Variables](#️-environment-variables) section below for details.  

4. **Install dependencies**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

5. **Run the development servers**
   - **Frontend:**  
     ```bash
     cd client
     npm run dev
     ```
   - **Backend:**  
     ```bash
     cd server
     npm run dev
     ```

6. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000) for the frontend.

---

## 🛠️ Environment Variables

Before running the project, copy the example files below and fill in your own credentials.

### Server (`server/.env`)
```env
PORT=3001
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=public"
S3_BUCKET_NAME=your-bucket-name
```

### Client (`client/.env`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your-cognito-user-pool-id
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your-cognito-client-id
```

---

## 🌐 Cloud & DevOps

- **AWS EC2** for backend hosting
- **AWS RDS** for managed PostgreSQL
- **AWS S3** for file storage
- **AWS Cognito** for authentication
- **AWS API Gateway** for secure routing
- **AWS Amplify** for frontend hosting and CI/CD

---
