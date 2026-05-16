# NexusCRM - Full Project Workflow & Architecture

NexusCRM is an enterprise-grade Customer Relationship Management system built with a high-performance **ASP.NET Core** backend and a modern **React** frontend. This document outlines the end-to-end technical and operational workflow of the application.

---

## 1. System Architecture
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, dnd-kit.
- **Backend**: ASP.NET Core Web API, Entity Framework Core.
- **Database**: PostgreSQL (Relational storage for Customers, Leads, Activities, etc.).
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).

---

## 2. User Authentication Workflow
1. **Login**: Users authenticate via `/login`. The backend generates a JWT containing User ID, Email, and Roles (Admin, Manager, Sales).
2. **Token Storage**: The frontend stores the token in `localStorage` (`crm_token`).
3. **Protected Routes**: Every frontend route is wrapped in an `AuthProvider`. If no token exists, the user is redirected to `/login`.
4. **Authorized Requests**: Every API call includes an `Authorization: Bearer {token}` header.

---

## 3. Lead Management & Pipeline Workflow
The "Lead Pipeline" is the core of the business logic.

### A. Lead Acquisition
- New leads are added via the **"Add Lead"** modal in the Leads list or Kanban board.
- Leads are initialized in the "New" stage with an estimated deal value.

### B. Kanban Pipeline (Board View)
- Users move leads between stages (Contacted -> Qualified -> Proposal -> Won/Lost) using **Drag & Drop**.
- **Technical Trigger**: On drop, the frontend fires a `PUT /api/leads/{id}` request to update the database. 
- **Activity Log**: Each movement is automatically logged in the global activity history.

### C. Lead Detail View
- Clicking the **"Eye" icon** on a lead opens the full detail profile.
- **Features**:
  - **Profile Overiew**: Key metrics (Value, Created Date, Assignee).
  - **Activity Timeline**: A chronological history of everything that happened to that lead.
  - **Notes Section**: Sales reps can leave internal comments.
  - **Follow-up Reminders**: Tracks next actions.

---

## 4. Customer Management Workflow
Once a Lead is marked as "Won", they become a full **Customer**.
- **List View**: Paginated list with real-time search functionality.
- **CRUD Operations**: Complete management of customer contact info and status.
- **Safety**: Custom validation popups prevent accidental deletion of customer data.

---

## 5. Analytics & Reporting Workflow
- **Global Dashboard**: Provides high-level KPIs (Total Customers, Revenue, Conversion Rate).
- **Lead Analytics Dashboard**:
  - **Conversion Status**: Radial charts showing Won vs. Lost distribution.
  - **Revenue Forecast**: Weighted pipeline calculation (Value × Probability based on Stage).
  - **Lead Sources**: Pie charts tracking lead acquisition channels.
  - **Sales Performance**: Bar charts comparing individual sales rep performance.
- **Technical**: Data is aggregated on the backend via SQL GroupBy queries in `ReportsController`.

---

## 6. Activity & Audit Tracking
- Every significant action (Lead created, Stage changed, Customer updated) is logged via the `ActivityService`.
- Logs include: `Timestamp`, `User`, `Action`, `Entity Type`, and `Description`.
- Accessible via the **"Activity Log"** menu for full system transparency.

---

## 7. Global UI/UX Standards
- **Real-time Feedback**: Success/Error "Toasts" appear for every form submission.
- **Loading States**: Buttons show "Saving..." or "Loading..." to prevent duplicate actions.
- **Validation Modals**: Destructive actions (Delete) always require a custom popup confirmation.
- **Responsive Design**: The sidebar and layout adapt seamlessly to mobile and desktop screens.

---

## 8. Deployment & Setup
- **Frontend Port**: `5173`
- **Backend Port**: `5146`
- **Database**: Runs on PostgreSQL (Port `5432`).
