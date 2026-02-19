# Database Schema Diagram

This diagram represents the current structure of the `gest-tools` database, including the recently added **Pets**, **Inventory**, and **Profession Templates** modules.

```mermaid
erDiagram
    %% Core Tenant Models
    Company ||--|{ Business : owns
    Business ||--o| GestorConfig : configures
    Business ||--|{ User : employs_or_serves
    Business ||--|{ Service : offers
    Business ||--|{ Product : sells
    Business ||--|{ Appointment : schedules
    Business ||--|{ Client : manages

    %% User & Auth
    User ||--o{ Appointment : books
    User ||--o{ Pet : owns
    User }|--|| Business : belongs_to
    
    %% Clients (CRM)
    Client ||--|{ Appointment : has
    Client ||--|{ ClientBono : holds
    Client ||--|{ ClientNote : has_notes
    Client }|--|| Business : registered_at

    %% Pets Module
    Pet }|--|| User : owned_by
    Pet ||--o{ Appointment : attends
    Pet ||--o{ ClientNote : medical_history
    Pet ||--o{ ClientPhoto : photos
    Pet ||--o{ SlotWaitlistEntry : waiting_for

    %% Services & Booking
    Service }|--|| ServiceCategory : categorized_in
    Service ||--o{ Appointment : booked_for
    Service ||--o{ SlotWaitlistEntry : waitlisted
    
    %% Inventory Module
    Product }|--|| Supplier : supplied_by
    Product ||--|{ StockMovement : tracks_history
    Product }|--|| Business : stock_of

    %% Professional Templates (System)
    Profession ||--|{ ProfessionCategory : has
    Profession ||--o{ GestorConfig : template_for
    ProfessionCategory ||--|{ ProfessionService : contains

    %% Configuration & Settings
    GestorConfig {
        string slug "Public URL slug"
        boolean bookingEnabled
        json socialLinks
    }

    %% Main Entities Details
    Appointment {
        string status
        string origin "online/manual"
        dateTime start
        dateTime end
    }

    Pet {
        string name
        string species
        boolean needsMuzzle
        boolean needsSedation
    }

    ClientNote {
        string type "FORMULA/VETERINARY/etc"
        string content
    }
```

## Key Relationships
- **Multi-tenancy**: `Business` is the central entity. Almost everything (`Service`, `Product`, `Client`) belongs to a `Business`.
- **Hybrid Users**: `User` can be a `gestor` (manager) or `client` (end-user). `Client` entity is also used specifically for the CRM profile.
- **Pets**: Linked to `User` (Owner) but integrated into `Appointment` and `ClientNote` for veterinary flows.
- **Inventory**: `StockMovement` tracks all changes (audit log) for `Product`.
