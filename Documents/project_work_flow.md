# NexusCRM - Full Project Workflow & Architecture

NexusCRM is an enterprise-grade Customer Relationship Management system built with a high-performance **ASP.NET Core** backend and a modern **React** frontend. This document outlines the end-to-end technical, operational, and testing workflow of the application.

---

## 1. System Architecture
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, dnd-kit.
- **Backend**: ASP.NET Core Web API, Entity Framework Core.
- **Database**: SQLite (Local embedded storage `crm.db` for instant offline-capable relational tables).
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
- Users move leads between stages (New -> Contacted -> Qualified -> Proposal Sent -> Negotiation -> Won -> Lost) using **Drag & Drop**.
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

## 8. Step-by-Step Module Verification Checklist

This section provides a rigorous step-by-step guide to verify and check every module in the CRM to ensure flawless enterprise operation.

### Module 1: Authentication & RBAC
1. **Navigate**: Open browser and go to `http://localhost:5173/`.
2. **Auto-Redirect**: Verify that you are immediately redirected to the `/login` page if not authenticated.
3. **Validation**: Attempt to click the submit button with empty input fields and confirm frontend HTML5 validations trigger.
4. **Invalid Login**: Type an invalid username or password, submit, and ensure a professional Red Toast notification displays with the error.
5. **Successful Login**: Enter correct credentials (e.g. `admin@crm.com` / `Admin@123`). Click submit, verify the Save button goes into a "Logging in..." loading state, and confirm you are smoothly transitioned to the `/` dashboard.

### Module 2: Dashboard Overview
1. **KPI Scorecards**: Look at the top metrics grid. Verify that the system dynamically calculates and displays:
   - Total Customers (with active indicators)
   - Total Revenue (formatted as standard currency)
   - Active Leads Count
   - Global Pipeline Conversion Rate
2. **Interaction**: Hover cursor over chart nodes to verify tooltips render with the exact aggregated values.

### Module 3: Leads Pipeline (Kanban Board)
1. **Navigate**: Select **Pipeline** in the Sidebar.
2. **Structure Check**: Confirm all 7 unified columns are visible: `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Negotiation`, `Won`, and `Lost`.
3. **Empty State Dropping**: Drag a card to a completely empty stage. Verify that the `useDroppable` container accurately highlights the boundary and allows a drop instantly.
4. **Real-time Stages Synchrony**: Drag a card between columns. Verify:
   - The card drops smoothly with visual transformations.
   - The stage count indicator in the column headers updates instantly.
   - Refresh the page and confirm the card **persists** exactly where you dropped it (proving backend PUT API hit).
5. **Click Stop-Propagation**: Click the Eye icon on a lead card. Confirm you are deep-linked directly to the Lead's detail page *without* initiating a card drag.

### Module 4: Lead Details & Activity Log
1. **Lead Header**: Open any Lead's details. Verify name, company, and value are accurate.
2. **Timeline History**: Verify the log shows chronologically ordered timestamps of all actions (e.g. "Moved lead to Contacted").
3. **Notes Module**: 
   - Add a new note in the text field. Click **"Add Note"**. Verify it displays in the timeline immediately.
4. **Reminders Checklist**: Schedule a follow-up reminder. Toggle completion to verify task status indicators.

### Module 5: Customer Hub
1. **List Pagination**: Click **Customers** in Sidebar. Verify pagination controls (`Previous` and `Next`) work.
2. **Search Input**: Type a customer's name, company, or email in the search bar. Press **Enter** and verify the grid dynamically filters results.
3. **Creation & Save Disable**: 
   - Click **"Add Customer"**. Type details. Click **"Save"**.
   - Verify the button displays **"Saving..."** and is disabled.
   - Verify the form auto-closes on success, a green Toast pops up, and the customer appears in the list.
4. **Popup Delete Validation**:
   - Select a customer and click the Trash button.
   - Confirm a gorgeous custom warning modal with a Red Alert Triangle overlays the screen.
   - Click **"Cancel"** and verify no deletion occurs.
   - Click **"Delete Now"** and verify the button goes into a disabled state, a toast is shown, and the customer is removed.

### Module 6: Reports & Analytics
1. **Lead Analytics**:
   - Go to **Lead Analytics** from Sidebar.
   - Verify the conversion status Radial chart represents Won vs. Lost deals.
   - Verify the Revenue Forecast scorecard matches your weighted values (Deal value multiplied by stage probability).
2. **Core Reports**:
   - Go to **Reports** from Sidebar.
   - Verify that your historical won revenue trend charts, growth curves, and activity distribution funnels are loaded.

---

## 9. Deployment & Setup
- **Frontend Port**: `5173`
- **Backend Port**: `5146`
- **Database**: Embedded SQLite Database (`crm.db`).

---

## 10. Appendix: Seeding & Test Credentials

### A. Default Test User Accounts
Use the following credentials to test Role-Based Access Control (RBAC):

| Role | Username (Email) | Password | Full Name |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@crm.com` | `Admin@123` | System Admin |
| **Sales Manager** | `manager@crm.com` | `Manager@123` | Jane Manager |
| **Sales Representative** | `sales@crm.com` | `Sales@123` | John Sales |

### B. Automatically Seeded Sample Data

#### 📁 Customer Accounts
| Client Name | Email Address | Phone Number | Business Company | Status |
| :--- | :--- | :--- | :--- | :--- |
| Acme Global Solutions | `billing@acmeglobal.com` | `+1 (555) 456-1122` | Acme Corp | **Active** |
| TechGiant Solutions LLC | `procurement@techgiant.io` | `+1 (555) 987-6543` | TechGiant | **Active** |
| Apex Creative Group | `hello@apexcreative.net` | `+1 (555) 321-7654` | Apex Creative | **Inactive** |
| Nova Health Systems | `contact@novahealth.org` | `+1 (555) 888-0019` | Nova Health | **Active** |

#### 🏷️ Pipeline Leads
| Deal / Lead Title | Company Name | Estimated Value | Current Stage | Contact Email | Contact Phone |
| :--- | :--- | :--- | :--- | :--- | :--- |
| SEO Optimization Campaign | Nova Dynamics | $4,500 | **New** | `marketing@novadynamics.com` | `+1 (555) 609-1244` |
| Custom ERP Migration | Alpha Manufacturing | $48,000 | **Contacted** | `it-ops@alphaman.com` | `+1 (555) 819-3322` |
| Mobile App Design Services | ByteLabs | $12,500 | **Qualified** | `contact@bytelabs.dev` | `+1 (555) 901-4400` |
| Cloud Migration Services Plan | CloudStream Inc | $35,000 | **Proposal Sent** | `inquiries@cloudstream.co` | `+1 (555) 234-9911` |
| Security Audit Package | SafeNet Solutions | $8,900 | **Negotiation** | `security@safenet.io` | `+1 (555) 765-8833` |
| Dedicated Staffing Partnership | TalentForce | $75,000 | **Won** | `hr@talentforce.com` | `+1 (555) 555-0100` |
| Hardware Upgrade Deal | Outdated Corp | $18,000 | **Lost** | `purchasing@outdated.org` | `+1 (555) 999-9000` |

#### 📝 Task Checklist
* **Task 1**: Review quarterly goals (High)
* **Task 2**: Call TechNova for renewal (Medium)
* **Task 3**: Draft proposal for Global IT (High)
* **Task 4**: Weekly Pipeline Sync (Low, Completed)
