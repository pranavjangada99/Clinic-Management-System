using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class VisitMedicine
{
    public int Id { get; set; }

    [Required]
    public int VisitId { get; set; }

    public Visit Visit { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Potency { get; set; }

    [MaxLength(100)]
    public string? Dose { get; set; }

    [MaxLength(150)]
    public string? Frequency { get; set; }

    [MaxLength(100)]
    public string? Duration { get; set; }

    [MaxLength(500)]
    public string? Instructions { get; set; }
}