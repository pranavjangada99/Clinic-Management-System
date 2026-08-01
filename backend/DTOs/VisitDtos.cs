using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class VisitMedicineDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Potency { get; set; }

    [MaxLength(100)]
    public string? Dose { get; set; }

    [MaxLength(150)]
    public string? Frequency { get; set; }

    [MaxLength(100)]
    public string? Duration { get; set; }

    [MaxLength(500)]
    public string? Instructions { get; set; }
}

public class CreateVisitDto
{
    [Required]
    public int PatientId { get; set; }

    public int? AppointmentId { get; set; }

    [Required]
    public DateOnly VisitDate { get; set; }

    [Required]
    public TimeOnly VisitTime { get; set; }

    [Required]
    [MaxLength(150)]
    public string Doctor { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string ChiefComplaints { get; set; } = string.Empty;

    [MaxLength(3000)]
    public string? Symptoms { get; set; }

    [MaxLength(2000)]
    public string? Diagnosis { get; set; }

    [MaxLength(5000)]
    public string? ClinicalNotes { get; set; }

    [MaxLength(3000)]
    public string? Advice { get; set; }

    public DateOnly? FollowUpDate { get; set; }

    public List<VisitMedicineDto> Medicines { get; set; } = new();
}

public class UpdateVisitDto
{
    [Required]
    [MaxLength(150)]
    public string Doctor { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string ChiefComplaints { get; set; } = string.Empty;

    [MaxLength(3000)]
    public string? Symptoms { get; set; }

    [MaxLength(2000)]
    public string? Diagnosis { get; set; }

    [MaxLength(5000)]
    public string? ClinicalNotes { get; set; }

    [MaxLength(3000)]
    public string? Advice { get; set; }

    public DateOnly? FollowUpDate { get; set; }

    public List<VisitMedicineDto> Medicines { get; set; } = new();
}

public class VisitMedicineResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Potency { get; set; }

    public string? Dose { get; set; }

    public string? Frequency { get; set; }

    public string? Duration { get; set; }

    public string? Instructions { get; set; }
}

public class VisitResponseDto
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public string PatientUhid { get; set; } = string.Empty;

    public string PatientName { get; set; } = string.Empty;

    public string PatientMobile { get; set; } = string.Empty;

    public int? AppointmentId { get; set; }

    public DateOnly VisitDate { get; set; }

    public TimeOnly VisitTime { get; set; }

    public string Doctor { get; set; } = string.Empty;

    public string ChiefComplaints { get; set; } = string.Empty;

    public string? Symptoms { get; set; }

    public string? Diagnosis { get; set; }

    public string? ClinicalNotes { get; set; }

    public string? Advice { get; set; }

    public DateOnly? FollowUpDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public List<VisitMedicineResponseDto> Medicines { get; set; } = new();

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}