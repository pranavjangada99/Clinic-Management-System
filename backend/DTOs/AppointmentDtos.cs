using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateAppointmentDto
{
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
}

public class UpdateAppointmentDto
{
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
    public string Status { get; set; } = string.Empty;
}

public class AppointmentResponseDto
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public string PatientUhid { get; set; } = string.Empty;

    public string PatientName { get; set; } = string.Empty;

    public string PatientMobile { get; set; } = string.Empty;

    public DateOnly AppointmentDate { get; set; }

    public TimeOnly AppointmentTime { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Doctor { get; set; } = string.Empty;

    public string? Reason { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}

public class UpdateAppointmentStatusDto
{
    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = string.Empty;
}