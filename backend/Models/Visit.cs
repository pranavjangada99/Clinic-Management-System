using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Visit
{
    public int Id { get; set; }

    [Required]
    public int PatientId { get; set; }

    public Patient Patient { get; set; } = null!;

    public int? AppointmentId { get; set; }

    public Appointment? Appointment { get; set; }

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

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "In Progress";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<VisitMedicine> Medicines { get; set; }
        = new List<VisitMedicine>();
}