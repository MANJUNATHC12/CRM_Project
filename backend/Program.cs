using Crm.Api.Data;
using Crm.Api.Models;
using Crm.Api.Repositories;
using Crm.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DB - Changed from SQLite to PostgreSQL (Neon)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Repository Pattern & Services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ILeadRepository, LeadRepository>();
builder.Services.AddScoped<ILeadService, LeadService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options => {
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT
var jwtSettings = builder.Configuration.GetSection("JwtConfig");
var secretKey = jwtSettings["Secret"];
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey!)),
        ValidateIssuer = false,
        ValidateAudience = false,
        RequireExpirationTime = false,
        ValidateLifetime = true
    };
})
;
// Google OAuth disabled temporarily
// .AddGoogle(options =>
// {
//     options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
//     options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
//     options.CallbackPath = "/signin-google";
// });

// Configure CORS for frontend - Added Vercel production URL
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://crm-project-gules-pi.vercel.app",
            "https://crm-project-h4hi.onrender.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Seed Roles
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    string[] roleNames = { "Admin", "Sales", "Manager" };
    foreach (var roleName in roleNames)
    {
        var roleExist = await roleManager.RoleExistsAsync(roleName);
        if (!roleExist)
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    // Seed Default Admin
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var adminEmail = "admin@crm.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new ApplicationUser { UserName = adminEmail, Email = adminEmail, FullName = "System Admin" };
        var result = await userManager.CreateAsync(adminUser, "Admin@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
    else
    {
        if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }

    // Seed Manager User
    var managerEmail = "manager@crm.com";
    var managerUser = await userManager.FindByEmailAsync(managerEmail);
    if (managerUser == null)
    {
        managerUser = new ApplicationUser { UserName = managerEmail, Email = managerEmail, FullName = "Jane Manager" };
        var result = await userManager.CreateAsync(managerUser, "Manager@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(managerUser, "Manager");
        }
    }
    else
    {
        if (!await userManager.IsInRoleAsync(managerUser, "Manager"))
        {
            await userManager.AddToRoleAsync(managerUser, "Manager");
        }
    }

    // Seed Sales Rep User
    var salesEmail = "sales@crm.com";
    var salesUser = await userManager.FindByEmailAsync(salesEmail);
    if (salesUser == null)
    {
        salesUser = new ApplicationUser { UserName = salesEmail, Email = salesEmail, FullName = "John Sales" };
        var result = await userManager.CreateAsync(salesUser, "Sales@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(salesUser, "Sales");
        }
    }
    else
    {
        if (!await userManager.IsInRoleAsync(salesUser, "Sales"))
        {
            await userManager.AddToRoleAsync(salesUser, "Sales");
        }
    }

    // Seed Database Sample Values
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Seed Customers if empty
    if (!db.Customers.Any())
    {
        db.Customers.AddRange(new List<Customer>
        {
            new Customer
            {
                Name = "Acme Global Solutions",
                Email = "billing@acmeglobal.com",
                Phone = "+1 (555) 456-1122",
                Company = "Acme Corp",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-60)
            },
            new Customer
            {
                Name = "TechGiant Solutions LLC",
                Email = "procurement@techgiant.io",
                Phone = "+1 (555) 987-6543",
                Company = "TechGiant",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-45)
            },
            new Customer
            {
                Name = "Apex Creative Group",
                Email = "hello@apexcreative.net",
                Phone = "+1 (555) 321-7654",
                Company = "Apex Creative",
                Status = "Inactive",
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new Customer
            {
                Name = "Nova Health Systems",
                Email = "contact@novahealth.org",
                Phone = "+1 (555) 888-0019",
                Company = "Nova Health",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            }
        });
    }

    // Seed Leads if empty
    if (!db.Leads.Any())
    {
        db.Leads.AddRange(new List<Lead>
        {
            new Lead
            {
                Title = "SEO Optimization Campaign",
                Company = "Nova Dynamics",
                Value = 4500,
                Stage = "New",
                Email = "marketing@novadynamics.com",
                Phone = "+1 (555) 609-1244",
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                Deadline = DateTime.UtcNow.AddDays(10),
                EndDate = null
            },
            new Lead
            {
                Title = "Custom ERP Migration",
                Company = "Alpha Manufacturing",
                Value = 48000,
                Stage = "Contacted",
                Email = "it-ops@alphaman.com",
                Phone = "+1 (555) 819-3322",
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                Deadline = DateTime.UtcNow.AddDays(5),
                EndDate = null
            },
            new Lead
            {
                Title = "Mobile App Design Services",
                Company = "ByteLabs",
                Value = 12500,
                Stage = "Qualified",
                Email = "contact@bytelabs.dev",
                Phone = "+1 (555) 901-4400",
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                Deadline = DateTime.UtcNow.AddDays(7),
                EndDate = null
            },
            new Lead
            {
                Title = "Cloud Migration Services Plan",
                Company = "CloudStream Inc",
                Value = 35000,
                Stage = "Proposal Sent",
                Email = "inquiries@cloudstream.co",
                Phone = "+1 (555) 234-9911",
                CreatedAt = DateTime.UtcNow.AddDays(-8),
                Deadline = DateTime.UtcNow.AddDays(12),
                EndDate = null
            },
            new Lead
            {
                Title = "Security Audit Package",
                Company = "SafeNet Solutions",
                Value = 8900,
                Stage = "Negotiation",
                Email = "security@safenet.io",
                Phone = "+1 (555) 765-8833",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                Deadline = DateTime.UtcNow.AddDays(3),
                EndDate = null
            },
            new Lead
            {
                Title = "Dedicated Staffing Partnership",
                Company = "TalentForce",
                Value = 75000,
                Stage = "Won",
                Email = "hr@talentforce.com",
                Phone = "+1 (555) 555-0100",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                Deadline = null,
                EndDate = DateTime.UtcNow.AddDays(-1)
            },
            new Lead
            {
                Title = "Hardware Upgrade Deal",
                Company = "Outdated Corp",
                Value = 18000,
                Stage = "Lost",
                Email = "purchasing@outdated.org",
                Phone = "+1 (555) 999-9000",
                CreatedAt = DateTime.UtcNow.AddDays(-12),
                Deadline = DateTime.UtcNow.AddDays(-2),
                EndDate = DateTime.UtcNow.AddDays(-3)
            }
        });
    }

    db.SaveChanges();
}

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();