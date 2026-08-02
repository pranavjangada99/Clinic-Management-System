using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } =
        string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(200)]
    public string NewPassword { get; set; } =
        string.Empty;

    [Required]
    public string ConfirmPassword { get; set; } =
        string.Empty;
}