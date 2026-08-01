using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Patient
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Uhid { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public DateOnly DateOfBirth { get; set; }

    [Required]
    [MaxLength(20)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    [MaxLength(15)]
    public string Mobile { get; set; } = string.Empty;

    [MaxLength(15)]
    public string? AlternateMobile { get; set; }

    [MaxLength(150)]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? State { get; set; }

    [MaxLength(10)]
    public string? PinCode { get; set; }

    [MaxLength(10)]
    public string? BloodGroup { get; set; }

    [MaxLength(150)]
    public string? ReferredBy { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}