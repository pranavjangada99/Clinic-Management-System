using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreatePaymentDto
{
    [Required]
    public int BillId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(30)]
    public string Method { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Reference { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}