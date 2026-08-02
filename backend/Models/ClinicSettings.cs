using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ClinicSettings
{
    public int Id { get; set; }

    // -------------------------
    // Clinic
    // -------------------------

    [Required]
    [MaxLength(200)]
    public string ClinicName { get; set; } =
        string.Empty;

    [MaxLength(20)]
    public string? ClinicPhone { get; set; }

    [MaxLength(200)]
    public string? ClinicEmail { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? State { get; set; }

    [MaxLength(10)]
    public string? PinCode { get; set; }

    // -------------------------
    // Doctor
    // -------------------------

    [Required]
    [MaxLength(200)]
    public string DoctorName { get; set; } =
        string.Empty;

    [MaxLength(200)]
    public string? Qualification { get; set; }

    [MaxLength(100)]
    public string? RegistrationNumber { get; set; }

    [MaxLength(150)]
    public string? Specialisation { get; set; }

    [MaxLength(20)]
    public string? DoctorPhone { get; set; }

    [MaxLength(200)]
    public string? DoctorEmail { get; set; }

    // -------------------------
    // Consultation
    // -------------------------

    public decimal DefaultConsultationFee { get; set; } =
        500;

    public decimal DefaultFollowUpFee { get; set; } =
        300;

    public int AppointmentDurationMinutes { get; set; } =
        30;

    public int DefaultFollowUpDays { get; set; } =
        15;

    public bool EnableAppointmentReminders { get; set; } =
        true;

    public bool AllowSameDayAppointments { get; set; } =
        true;

    // -------------------------
    // Billing
    // -------------------------

    [MaxLength(10)]
    public string Currency { get; set; } =
        "INR";

    [MaxLength(500)]
    public string ReceiptFooter { get; set; } =
        "Thank you for your payment.";

    [MaxLength(1000)]
    public string InvoiceFooter { get; set; } =
        "Thank you for visiting.";

    public bool AllowPartialPayments { get; set; } =
        true;

    public bool PrintReceiptAfterPayment { get; set; } =
        true;

    public bool ShowOutstandingBalance { get; set; } =
        true;

    // -------------------------
    // Numbering
    // -------------------------

    [Required]
    [MaxLength(50)]
    public string PatientUhidPrefix { get; set; } =
        "SMHC";

    public int NextPatientNumber { get; set; } =
        1;

    [Required]
    [MaxLength(50)]
    public string InvoicePrefix { get; set; } =
        $"INV-{DateTime.Today.Year}";

    public int NextInvoiceNumber { get; set; } =
        1;

    [Required]
    [MaxLength(50)]
    public string ReceiptPrefix { get; set; } =
        $"REC-{DateTime.Today.Year}";

    public int NextReceiptNumber { get; set; } =
        1;

    // -------------------------
    // Audit
    // -------------------------

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } =
        DateTime.UtcNow;
}