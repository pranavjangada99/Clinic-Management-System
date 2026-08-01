using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class BillItem
{
    public int Id { get; set; }

    [Required]
    public int BillId { get; set; }

    [Required]
    [MaxLength(250)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int Quantity { get; set; }

    [Required]
    public decimal Rate { get; set; }

    public Bill Bill { get; set; } = null!;
}