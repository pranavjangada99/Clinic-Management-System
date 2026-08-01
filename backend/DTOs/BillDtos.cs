using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateBillItemDto
{
    [Required]
    [MaxLength(250)]
    public string Description { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Rate { get; set; }
}

public class CreateBillDto
{
    [Required]
    public int PatientId { get; set; }

    [Required]
    public DateOnly BillDate { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Discount { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Paid { get; set; }

    [Required]
    [MinLength(1)]
    public List<CreateBillItemDto> Items { get; set; } = new();
}

public class BillItemResponseDto
{
    public int Id { get; set; }

    public string Description { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal Rate { get; set; }

    public decimal Amount { get; set; }
}

public class BillResponseDto
{
    public int Id { get; set; }

    public string BillNumber { get; set; } = string.Empty;

    public int PatientId { get; set; }

    public string PatientName { get; set; } = string.Empty;

    public string PatientUhid { get; set; } = string.Empty;

    public string PatientMobile { get; set; } = string.Empty;

    public DateOnly BillDate { get; set; }

    public List<BillItemResponseDto> Items { get; set; } = new();

    public decimal Subtotal { get; set; }

    public decimal Discount { get; set; }

    public decimal Total { get; set; }

    public decimal Paid { get; set; }

    public decimal Balance { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}