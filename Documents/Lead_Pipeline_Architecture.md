# Lead Pipeline Module Architecture

## 1. Database Schema

The Lead Pipeline relies on a structured database schema to track prospects through various stages until conversion. In an EF Core / SQLite environment, the primary entity is the `Lead`, supplemented by relationships.

### Core Entities

**`Leads` Table**
*   `Id` (PK, int)
*   `Name` (string): Lead contact name
*   `Company` (string): Organization name
*   `Email` (string)
*   `Phone` (string)
*   `Stage` (string): Current pipeline stage (e.g., "New", "Contacted", "Qualified", "Proposal", "Won", "Lost")
*   `EstimatedValue` (decimal): Potential revenue from the lead
*   `AssignedToUserId` (FK, string): References `AspNetUsers.Id` for lead ownership
*   `CreatedAt` (DateTime)
*   `UpdatedAt` (DateTime)

**`ActivityLogs` Table** (Shared Service)
*   `Id` (PK, int)
*   `EntityType` (string): e.g., "Lead"
*   `EntityId` (int): References `Leads.Id`
*   `Action` (string): e.g., "Created", "Stage_Changed", "Note_Added"
*   `UserId` (FK, string): User who performed the action
*   `Timestamp` (DateTime)

---

## 2. Backend Architecture (ASP.NET Core)

The backend follows a standard N-Tier architecture to ensure separation of concerns and maintainability.

*   **API Layer (`Controllers/LeadsController.cs`)**: Handles HTTP requests, JWT authorization (`[Authorize]`), input validation (`ModelState`), and returns appropriate HTTP status codes (200, 201, 404, 500).
*   **Service Layer (`Services/LeadService.cs`)**: Contains the business logic. Handles operations like stage transitions, checking if a lead can be converted, and coordinating with the `ActivityService` to log changes.
*   **Data Access Layer (`Repositories/LeadRepository.cs`)**: Abstracts Entity Framework Core (`ApplicationDbContext`). Performs CRUD operations and complex queries (e.g., fetching leads by assigned user or stage).
*   **DTOs (`DTOs/LeadDTOs.cs`)**: Data Transfer Objects isolate the internal domain models from the API payload (e.g., `CreateLeadDto`, `UpdateLeadStageDto`).

---

## 3. Frontend Architecture (React + Vite)

The frontend is a React Single Page Application (SPA) utilizing Tailwind CSS for styling and `lucide-react` for iconography.

*   **State Management**: React `useState` and `useEffect` hooks manage the lead data array and modal states. For drag-and-drop pipelines, tools like `dnd-kit` or `react-beautiful-dnd` can be integrated.
*   **UI Components**:
    *   **Kanban Board / Pipeline View**: A visual representation of stages. Leads are cards that can be dragged between stage columns.
    *   **List View**: A traditional data table view for bulk actions and sorting.
    *   **Lead Detail Modal**: A slide-over or central modal showing contact info, estimated value, and activity history.
*   **Authentication Hooks**: The custom `useAuth` hook ensures the JWT token is attached to all fetch requests and handles 401 Unauthorized redirects.

---

## 4. API Structure

The RESTful API provides comprehensive endpoints for managing the lead lifecycle.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leads` | Retrieve all leads (supports `?stage=` and `?assignedTo=` filtering). | Yes |
| `GET` | `/api/leads/{id}` | Retrieve a specific lead and its details. | Yes |
| `POST` | `/api/leads` | Create a new lead. Automatically logs "Created" activity. | Yes |
| `PUT` | `/api/leads/{id}` | Update lead details. | Yes |
| `PATCH`| `/api/leads/{id}/stage` | Specialized endpoint to quickly update just the lead's pipeline stage. | Yes |
| `DELETE`| `/api/leads/{id}` | Remove a lead. | Yes |

---

## 5. Recommended Workflow

This workflow represents the standard operating procedure for a sales representative using the module.

1.  **Lead Capture**: A new prospect is entered into the system (manually via the UI or via API integration) and defaults to the **"New"** stage.
2.  **Assignment**: The lead is assigned to a specific Sales Rep (`AssignedToUserId`).
3.  **Initial Contact**: The rep reaches out via email or phone. The rep updates the stage to **"Contacted"** and adds a note summarizing the interaction.
4.  **Qualification**: If the lead is a good fit, they are moved to **"Qualified"**. An `EstimatedValue` is assigned.
5.  **Proposal/Negotiation**: The rep sends a quote. The lead stage is moved to **"Proposal"**.
6.  **Conversion / Closure**:
    *   If successful, the lead is moved to **"Won"**. The system can trigger a webhook or service to automatically create a "Customer" record from the Lead data.
    *   If unsuccessful, the lead is moved to **"Lost"**, and an activity note is required to explain the loss reason.
7.  **Analytics Tracking**: The Reports module polls `/api/reports/leads-by-stage` to update real-time dashboards showing pipeline health and conversion rates.
