using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Payment
{
    public int Id { get; set; }

    [Required]
    public int BillId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(30)]
    public string Method { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Reference { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required]
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Bill Bill { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string ReceiptNumber { get; set; } = string.Empty;
}