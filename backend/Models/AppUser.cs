using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class AppUser
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(500)]
    public string PasswordHash { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(100)]
    public string DisplayName { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } =
        "Administrator";

    public bool IsActive { get; set; } =
        true;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }
}