# EF Core Models: Lead Pipeline

These ASP.NET Core Entity Framework models represent the complete Lead Pipeline module. They include data validation, navigation properties for relationships, standard audit fields, and soft-delete support.

### 1. Base Audit Entity
A base class to handle common fields across all tables.

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace Crm.Api.Models
{
    public abstract class AuditableEntity
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }

        // Soft Delete Support
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
    }
}
```

### 2. LeadStage

```csharp
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Crm.Api.Models
{
    public class LeadStage : AuditableEntity
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Stage name is required")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation Properties
        public ICollection<Lead> Leads { get; set; } = new List<Lead>();
    }
}
```

### 3. Lead

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Crm.Api.Models
{
    public enum LeadStatus { Active, Converted, Lost, Archived }
    public enum LeadPriority { Low, Medium, High, Urgent }

    public class Lead : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required(ErrorMessage = "First name is required")]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required")]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? CompanyName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(255)]
        public string? Email { get; set; }

        [Phone]
        [MaxLength(50)]
        public string? Phone { get; set; }

        public LeadStatus Status { get; set; } = LeadStatus.Active;
        public LeadPriority Priority { get; set; } = LeadPriority.Medium;

        [Column(TypeName = "decimal(15,2)")]
        public decimal EstimatedValue { get; set; } = 0;

        [MaxLength(100)]
        public string? Source { get; set; }

        // Foreign Keys
        public int? StageId { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(StageId))]
        public LeadStage? Stage { get; set; }

        public ICollection<LeadNote> Notes { get; set; } = new List<LeadNote>();
        public ICollection<LeadActivity> Activities { get; set; } = new List<LeadActivity>();
        public ICollection<LeadFollowUp> FollowUps { get; set; } = new List<LeadFollowUp>();
        public ICollection<LeadAssignment> Assignments { get; set; } = new List<LeadAssignment>();
    }
}
```

### 4. LeadAssignment

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Crm.Api.Models
{
    public class LeadAssignment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid LeadId { get; set; }

        [Required]
        public string AssignedToUserId { get; set; } = string.Empty; // Maps to ApplicationUser

        public string? AssignedByUserId { get; set; }

        public bool IsCurrent { get; set; } = true;

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UnassignedAt { get; set; }

        // Navigation Property
        [ForeignKey(nameof(LeadId))]
        public Lead? Lead { get; set; }
    }
}
```

### 5. LeadNote

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Crm.Api.Models
{
    public class LeadNote : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid LeadId { get; set; }

        [Required(ErrorMessage = "Note content cannot be empty")]
        public string Content { get; set; } = string.Empty;

        // Navigation Property
        [ForeignKey(nameof(LeadId))]
        public Lead? Lead { get; set; }
    }
}
```

### 6. LeadActivity

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Crm.Api.Models
{
    public class LeadActivity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid LeadId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ActivityType { get; set; } = string.Empty; // e.g., "StageChanged", "EmailSent"

        public string? Description { get; set; }
        
        [MaxLength(255)]
        public string? OldValue { get; set; }
        
        [MaxLength(255)]
        public string? NewValue { get; set; }

        public string? PerformedByUserId { get; set; }
        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property
        [ForeignKey(nameof(LeadId))]
        public Lead? Lead { get; set; }
    }
}
```

### 7. LeadFollowUp

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Crm.Api.Models
{
    public class LeadFollowUp : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid LeadId { get; set; }

        [Required]
        public string AssignedToUserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string FollowUpType { get; set; } = string.Empty; // e.g., "Call", "Email", "Meeting"

        public string? Description { get; set; }

        [Required]
        public DateTime ScheduledAt { get; set; }

        public bool IsCompleted { get; set; } = false;
        public DateTime? CompletedAt { get; set; }

        // Navigation Property
        [ForeignKey(nameof(LeadId))]
        public Lead? Lead { get; set; }
    }
}
```

### DbContext Configuration Example
To enforce the Soft Delete behavior globally, you should add a query filter in your `ApplicationDbContext`'s `OnModelCreating` method:

```csharp
protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);

    // Global query filters for Soft Delete
    builder.Entity<Lead>().HasQueryFilter(l => !l.IsDeleted);
    builder.Entity<LeadStage>().HasQueryFilter(ls => !ls.IsDeleted);
    builder.Entity<LeadNote>().HasQueryFilter(ln => !ln.IsDeleted);
    builder.Entity<LeadFollowUp>().HasQueryFilter(lf => !lf.IsDeleted);
}
```
