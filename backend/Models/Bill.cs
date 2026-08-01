using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Bill
{
    public int Id { get; set; }

    [Required]
    [MaxLength(30)]
    public string BillNumber { get; set; } = string.Empty;

    [Required]
    public int PatientId { get; set; }

    [Required]
    public DateOnly BillDate { get; set; }

    public decimal Subtotal { get; set; }

    public decimal Discount { get; set; }

    public decimal Total { get; set; }

    public decimal Paid { get; set; }

    public decimal Balance { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Unpaid";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Patient Patient { get; set; } = null!;

    public List<BillItem> Items { get; set; } = new();
}