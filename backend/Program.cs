using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

var builder =
    WebApplication.CreateBuilder(
        args
    );

builder.Services.AddControllers();

builder.Services.AddScoped<
    DatabaseBackupService
>();

builder.Services.AddOpenApi();

builder.Services.AddDbContext<
    ClinicDbContext
>(
    options =>
        options.UseSqlite(
            builder.Configuration
                .GetConnectionString(
                    "ClinicDatabase"
                )
        )
);

// ---------------------------------
// Authentication
// ---------------------------------

builder.Services
    .AddAuthentication(
        "ClinicCookie"
    )
    .AddCookie(
        "ClinicCookie",
        options =>
        {
            options.Cookie.Name =
                "ClinicManagement.Auth";

            options.Cookie.HttpOnly =
                true;

            options.Cookie.SameSite =
                SameSiteMode.Lax;

            options.Cookie.SecurePolicy =
                CookieSecurePolicy
                    .SameAsRequest;

            options.ExpireTimeSpan =
                TimeSpan.FromHours(12);

            options.SlidingExpiration =
                true;

            // APIs should return
            // 401/403 instead of
            // redirecting to HTML pages.

            options.Events
                .OnRedirectToLogin =
                context =>
                {
                    context.Response
                        .StatusCode =
                        StatusCodes
                            .Status401Unauthorized;

                    return Task
                        .CompletedTask;
                };

            options.Events
                .OnRedirectToAccessDenied =
                context =>
                {
                    context.Response
                        .StatusCode =
                        StatusCodes
                            .Status403Forbidden;

                    return Task
                        .CompletedTask;
                };
        }
    );

// Require authentication by default.
// AuthController setup/login endpoints
// explicitly use [AllowAnonymous].

builder.Services.AddAuthorization(
    options =>
    {
        options.FallbackPolicy =
            new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
    }
);

// ---------------------------------
// CORS
// ---------------------------------

builder.Services.AddCors(
    options =>
    {
        options.AddPolicy(
            "Frontend",
            policy =>
            {
                policy
                    .WithOrigins(
                        "http://localhost:5173"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
        );
    }
);

var app =
    builder.Build();

// Keep the local SQLite database schema in sync with the app.
// This makes first-run and future upgrades safer for clinic installations.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<ClinicDbContext>();

    db.Database.Migrate();
}

if (
    app.Environment
        .IsDevelopment()
)
{
    app.MapOpenApi();
}

app.UseCors("Frontend");

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();