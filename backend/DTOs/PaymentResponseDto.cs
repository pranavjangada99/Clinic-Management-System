namespace backend.DTOs;

public class PaymentResponseDto
{
    public int Id { get; set; }

    public int BillId { get; set; }

    public string BillNumber { get; set; } = string.Empty;

    public int PatientId { get; set; }

    public string PatientName { get; set; } = string.Empty;

    public string PatientUhid { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Method { get; set; } = string.Empty;

    public string? Reference { get; set; }

    public string? Notes { get; set; }

    public DateTime PaymentDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public string ReceiptNumber { get; set; } = string.Empty;
}