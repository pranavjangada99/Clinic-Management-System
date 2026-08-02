using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ClinicDbContext _context;

    private readonly
        PasswordHasher<AppUser>
        _passwordHasher;

    public AuthController(
        ClinicDbContext context
    )
    {
        _context = context;

        _passwordHasher =
            new PasswordHasher<AppUser>();
    }

    // ---------------------------------
    // GET: api/auth/setup-status
    // ---------------------------------

    [AllowAnonymous]
    [HttpGet("setup-status")]
    public async Task<IActionResult>
        GetSetupStatus()
    {
        var hasUsers =
            await _context.AppUsers
                .AnyAsync();

        return Ok(
            new
            {
                requiresSetup =
                    !hasUsers
            }
        );
    }

    // ---------------------------------
    // POST: api/auth/setup
    // ---------------------------------

    [AllowAnonymous]
    [HttpPost("setup")]
    public async Task<IActionResult>
        Setup(
            SetupAdminDto dto
        )
    {
        var hasUsers =
            await _context.AppUsers
                .AnyAsync();

        if (hasUsers)
        {
            return BadRequest(
                "Administrator setup has already been completed."
            );
        }

        var username =
            dto.Username.Trim();

        var displayName =
            dto.DisplayName.Trim();

        if (
            string.IsNullOrWhiteSpace(
                username
            )
        )
        {
            return BadRequest(
                "Username is required."
            );
        }

        if (
            string.IsNullOrWhiteSpace(
                displayName
            )
        )
        {
            return BadRequest(
                "Display name is required."
            );
        }

        var passwordError =
            ValidatePassword(
                dto.Password
            );

        if (passwordError != null)
        {
            return BadRequest(
                passwordError
            );
        }

        var user =
            new AppUser
            {
                Username =
                    username,

                DisplayName =
                    displayName,

                Role =
                    "Administrator",

                IsActive =
                    true,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    DateTime.UtcNow
            };

        user.PasswordHash =
            _passwordHasher.HashPassword(
                user,
                dto.Password
            );

        _context.AppUsers.Add(user);

        await _context.SaveChangesAsync();

        await SignInUserAsync(user);

        return Ok(
            ToUserResponse(user)
        );
    }

    // ---------------------------------
    // POST: api/auth/login
    // ---------------------------------

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult>
        Login(
            LoginDto dto
        )
    {
        var username =
            dto.Username.Trim();

        var user =
            await _context.AppUsers
                .FirstOrDefaultAsync(
                    item =>
                        item.Username ==
                        username
                );

        if (
            user == null ||
            !user.IsActive
        )
        {
            return Unauthorized(
                "Invalid username or password."
            );
        }

        var verification =
            _passwordHasher
                .VerifyHashedPassword(
                    user,
                    user.PasswordHash,
                    dto.Password
                );

        if (
            verification ==
            PasswordVerificationResult
                .Failed
        )
        {
            return Unauthorized(
                "Invalid username or password."
            );
        }

        if (
            verification ==
            PasswordVerificationResult
                .SuccessRehashNeeded
        )
        {
            user.PasswordHash =
                _passwordHasher
                    .HashPassword(
                        user,
                        dto.Password
                    );
        }

        user.LastLoginAt =
            DateTime.UtcNow;

        user.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await SignInUserAsync(user);

        return Ok(
            ToUserResponse(user)
        );
    }

    // ---------------------------------
    // GET: api/auth/me
    // ---------------------------------

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult>
        Me()
    {
        var user =
            await GetCurrentUserAsync();

        if (user == null)
        {
            return Unauthorized();
        }

        return Ok(
            ToUserResponse(user)
        );
    }

    // ---------------------------------
    // POST: api/auth/logout
    // ---------------------------------

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult>
        Logout()
    {
        await HttpContext.SignOutAsync(
            "ClinicCookie"
        );

        return NoContent();
    }

    // ---------------------------------
    // POST: api/auth/change-password
    // ---------------------------------

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult>
        ChangePassword(
            ChangePasswordDto dto
        )
    {
        var user =
            await GetCurrentUserAsync();

        if (user == null)
        {
            return Unauthorized();
        }

        var verification =
            _passwordHasher
                .VerifyHashedPassword(
                    user,
                    user.PasswordHash,
                    dto.CurrentPassword
                );

        if (
            verification ==
            PasswordVerificationResult
                .Failed
        )
        {
            return BadRequest(
                "Current password is incorrect."
            );
        }

        if (
            dto.NewPassword !=
            dto.ConfirmPassword
        )
        {
            return BadRequest(
                "New password and confirmation do not match."
            );
        }

        var passwordError =
            ValidatePassword(
                dto.NewPassword
            );

        if (passwordError != null)
        {
            return BadRequest(
                passwordError
            );
        }

        if (
            dto.NewPassword ==
            dto.CurrentPassword
        )
        {
            return BadRequest(
                "New password must be different from the current password."
            );
        }

        user.PasswordHash =
            _passwordHasher
                .HashPassword(
                    user,
                    dto.NewPassword
                );

        user.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(
            new
            {
                message =
                    "Password changed successfully."
            }
        );
    }

    // ---------------------------------
    // Current user
    // ---------------------------------

    private async Task<AppUser?>
        GetCurrentUserAsync()
    {
        var idValue =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

        if (
            !int.TryParse(
                idValue,
                out var userId
            )
        )
        {
            return null;
        }

        return await _context.AppUsers
            .FirstOrDefaultAsync(
                user =>
                    user.Id == userId &&
                    user.IsActive
            );
    }

    // ---------------------------------
    // Sign in
    // ---------------------------------

    private async Task SignInUserAsync(
        AppUser user
    )
    {
        var claims =
            new List<Claim>
            {
                new(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()
                ),

                new(
                    ClaimTypes.Name,
                    user.Username
                ),

                new(
                    "DisplayName",
                    user.DisplayName
                ),

                new(
                    ClaimTypes.Role,
                    user.Role
                )
            };

        var identity =
            new ClaimsIdentity(
                claims,
                "ClinicCookie"
            );

        var principal =
            new ClaimsPrincipal(
                identity
            );

        var properties =
            new AuthenticationProperties
            {
                IsPersistent = true,

                AllowRefresh = true,

                ExpiresUtc =
                    DateTimeOffset.UtcNow
                        .AddHours(12)
            };

        await HttpContext.SignInAsync(
            "ClinicCookie",
            principal,
            properties
        );
    }

    // ---------------------------------
    // Password rules
    // ---------------------------------

    private static string?
        ValidatePassword(
            string password
        )
    {
        if (
            string.IsNullOrWhiteSpace(
                password
            ) ||
            password.Length < 8
        )
        {
            return
                "Password must contain at least 8 characters.";
        }

        if (
            !password.Any(char.IsUpper)
        )
        {
            return
                "Password must contain at least one uppercase letter.";
        }

        if (
            !password.Any(char.IsLower)
        )
        {
            return
                "Password must contain at least one lowercase letter.";
        }

        if (
            !password.Any(char.IsDigit)
        )
        {
            return
                "Password must contain at least one number.";
        }

        return null;
    }

    private static object
        ToUserResponse(
            AppUser user
        )
    {
        return new
        {
            user.Id,
            user.Username,
            user.DisplayName,
            user.Role,
            user.LastLoginAt
        };
    }
}