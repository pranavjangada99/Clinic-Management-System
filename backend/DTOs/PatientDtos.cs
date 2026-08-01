using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreatePatientDto
{
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

    [EmailAddress]
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
}

public class UpdatePatientDto
{
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

    [EmailAddress]
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
}

public class PatientResponseDto
{
    public int Id { get; set; }

    public string Uhid { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public DateOnly DateOfBirth { get; set; }

    public int Age { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string Mobile { get; set; } = string.Empty;

    public string? AlternateMobile { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? PinCode { get; set; }

    public string? BloodGroup { get; set; }

    public string? ReferredBy { get; set; }

    public string? Notes { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}