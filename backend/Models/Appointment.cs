using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Appointment
{
    public int Id { get; set; }

    [Required]
    public int PatientId { get; set; }

    [Required]
    public DateOnly AppointmentDate { get; set; }

    [Required]
    public TimeOnly AppointmentTime { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Doctor { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Reason { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Scheduled";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Patient Patient { get; set; } = null!;
}