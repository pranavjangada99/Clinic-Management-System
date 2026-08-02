using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/backup")]
public class BackupController : ControllerBase
{
    private const long
        MaxRestoreFileSize =
            500L * 1024L * 1024L;

    private readonly
        DatabaseBackupService
        _backupService;

    public BackupController(
        DatabaseBackupService
            backupService
    )
    {
        _backupService =
            backupService;
    }

    // ---------------------------------
    // GET: api/backup
    // ---------------------------------

    [HttpGet]
    public ActionResult<
        IEnumerable<BackupInfo>
    > GetBackups()
    {
        try
        {
            return Ok(
                _backupService
                    .GetBackups()
            );
        }
        catch (Exception exception)
        {
            return Problem(
                detail:
                    exception.Message,

                title:
                    "Unable to load backups."
            );
        }
    }

    // ---------------------------------
    // POST: api/backup
    // ---------------------------------

    [HttpPost]
    public async Task<
        ActionResult<BackupInfo>
    > CreateBackup()
    {
        try
        {
            var backup =
                await _backupService
                    .CreateBackupAsync();

            return Ok(backup);
        }
        catch (Exception exception)
        {
            return Problem(
                detail:
                    exception.Message,

                title:
                    "Unable to create backup."
            );
        }
    }

    // ---------------------------------
    // GET: api/backup/download/{file}
    // ---------------------------------

    [HttpGet(
        "download/{fileName}"
    )]
    public IActionResult Download(
        string fileName
    )
    {
        try
        {
            var path =
                _backupService
                    .GetBackupPath(
                        fileName
                    );

            if (!System.IO.File.Exists(path))
            {
                return NotFound(
                    "Backup file was not found."
                );
            }

            return PhysicalFile(
                path,

                "application/octet-stream",

                Path.GetFileName(path)
            );
        }
        catch (
            InvalidOperationException
            exception
        )
        {
            return BadRequest(
                exception.Message
            );
        }
    }

    // ---------------------------------
    // DELETE: api/backup/{file}
    // ---------------------------------

    [HttpDelete("{fileName}")]
    public IActionResult DeleteBackup(
        string fileName
    )
    {
        try
        {
            _backupService
                .DeleteBackup(
                    fileName
                );

            return NoContent();
        }
        catch (
            FileNotFoundException
        )
        {
            return NotFound(
                "Backup file was not found."
            );
        }
        catch (
            InvalidOperationException
            exception
        )
        {
            return BadRequest(
                exception.Message
            );
        }
    }

    // ---------------------------------
    // POST: api/backup/restore
    // ---------------------------------

    [HttpPost("restore")]
    [RequestSizeLimit(
        MaxRestoreFileSize
    )]
    public async Task<IActionResult>
        Restore(
            IFormFile file
        )
    {
        if (
            file == null ||
            file.Length == 0
        )
        {
            return BadRequest(
                "Please select a backup file."
            );
        }

        if (
            file.Length >
            MaxRestoreFileSize
        )
        {
            return BadRequest(
                "Backup file is too large."
            );
        }

        if (
            !file.FileName.EndsWith(
                ".db",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            return BadRequest(
                "Only .db backup files are supported."
            );
        }

        try
        {
            await using var stream =
                file.OpenReadStream();

            var result =
                await _backupService
                    .RestoreAsync(
                        stream,
                        file.FileName
                    );

            return Ok(
                new
                {
                    message =
                        "Database restored successfully.",

                    safetyBackup =
                        result
                            .SafetyBackupFileName
                }
            );
        }
        catch (
            InvalidOperationException
            exception
        )
        {
            return BadRequest(
                exception.Message
            );
        }
        catch (Exception exception)
        {
            return Problem(
                detail:
                    exception.Message,

                title:
                    "Database restore failed."
            );
        }
    }
}