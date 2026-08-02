using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class SetupAdminDto
{
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(100)]
    public string DisplayName { get; set; } =
        string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(200)]
    public string Password { get; set; } =
        string.Empty;
}