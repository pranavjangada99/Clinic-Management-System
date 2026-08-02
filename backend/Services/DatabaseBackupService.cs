using Microsoft.Data.Sqlite;

namespace backend.Services;

public class DatabaseBackupService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public DatabaseBackupService(
        IConfiguration configuration,
        IWebHostEnvironment environment
    )
    {
        _configuration = configuration;
        _environment = environment;
    }

    // ---------------------------------
    // Paths
    // ---------------------------------

    public string GetDatabasePath()
    {
        var connectionString =
            _configuration.GetConnectionString(
                "ClinicDatabase"
            );

        if (
            string.IsNullOrWhiteSpace(
                connectionString
            )
        )
        {
            throw new InvalidOperationException(
                "Clinic database connection string was not found."
            );
        }

        var builder =
            new SqliteConnectionStringBuilder(
                connectionString
            );

        if (
            string.IsNullOrWhiteSpace(
                builder.DataSource
            )
        )
        {
            throw new InvalidOperationException(
                "Clinic database path was not found."
            );
        }

        if (
            Path.IsPathRooted(
                builder.DataSource
            )
        )
        {
            return Path.GetFullPath(
                builder.DataSource
            );
        }

        return Path.GetFullPath(
            Path.Combine(
                _environment.ContentRootPath,
                builder.DataSource
            )
        );
    }

    public string GetBackupDirectory()
    {
        var path =
            Path.Combine(
                _environment.ContentRootPath,
                "Backups"
            );

        Directory.CreateDirectory(path);

        return path;
    }

    // ---------------------------------
    // Create backup
    // ---------------------------------

    public async Task<BackupInfo>
        CreateBackupAsync(
            string prefix = "clinic-backup"
        )
    {
        var backupDirectory =
            GetBackupDirectory();

        var timestamp =
            DateTime.Now.ToString(
                "yyyyMMdd-HHmmss-fff"
            );

        var safePrefix =
            SanitizePrefix(prefix);

        var fileName =
            $"{safePrefix}-{timestamp}.db";

        var backupPath =
            Path.Combine(
                backupDirectory,
                fileName
            );

        await BackupDatabaseToFileAsync(
            backupPath
        );

        var fileInfo =
            new FileInfo(backupPath);

        return new BackupInfo
        {
            FileName =
                fileInfo.Name,

            SizeBytes =
                fileInfo.Length,

            CreatedAt =
                fileInfo.CreationTimeUtc
        };
    }

    // ---------------------------------
    // Backup current DB to specific file
    // ---------------------------------

    private async Task
        BackupDatabaseToFileAsync(
            string destinationPath
        )
    {
        var databasePath =
            GetDatabasePath();

        if (!File.Exists(databasePath))
        {
            throw new FileNotFoundException(
                "Clinic database file was not found.",
                databasePath
            );
        }

        var sourceConnectionString =
            new SqliteConnectionStringBuilder
            {
                DataSource =
                    databasePath,

                Mode =
                    SqliteOpenMode.ReadWrite,

                Cache =
                    SqliteCacheMode.Shared
            }.ToString();

        var destinationConnectionString =
            new SqliteConnectionStringBuilder
            {
                DataSource =
                    destinationPath,

                Mode =
                    SqliteOpenMode.ReadWriteCreate
            }.ToString();

        await using var source =
            new SqliteConnection(
                sourceConnectionString
            );

        await using var destination =
            new SqliteConnection(
                destinationConnectionString
            );

        await source.OpenAsync();

        await destination.OpenAsync();

        source.BackupDatabase(
            destination
        );
    }

    // ---------------------------------
    // List backups
    // ---------------------------------

    public List<BackupInfo>
        GetBackups()
    {
        var backupDirectory =
            GetBackupDirectory();

        return Directory
            .GetFiles(
                backupDirectory,
                "*.db"
            )
            .Select(
                path =>
                {
                    var info =
                        new FileInfo(path);

                    return new BackupInfo
                    {
                        FileName =
                            info.Name,

                        SizeBytes =
                            info.Length,

                        CreatedAt =
                            info.CreationTimeUtc
                    };
                }
            )
            .OrderByDescending(
                backup =>
                    backup.CreatedAt
            )
            .ToList();
    }

    // ---------------------------------
    // Get backup for download
    // ---------------------------------

    public string GetBackupPath(
        string fileName
    )
    {
        var safeFileName =
            Path.GetFileName(
                fileName
            );

        if (
            string.IsNullOrWhiteSpace(
                safeFileName
            ) ||
            !safeFileName.EndsWith(
                ".db",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            throw new InvalidOperationException(
                "Invalid backup file."
            );
        }

        var backupDirectory =
            GetBackupDirectory();

        var fullPath =
            Path.GetFullPath(
                Path.Combine(
                    backupDirectory,
                    safeFileName
                )
            );

        var fullBackupDirectory =
            Path.GetFullPath(
                backupDirectory
            );

        if (
            !fullPath.StartsWith(
                fullBackupDirectory +
                Path.DirectorySeparatorChar,
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            throw new InvalidOperationException(
                "Invalid backup path."
            );
        }

        return fullPath;
    }

    // ---------------------------------
    // Delete backup
    // ---------------------------------

    public void DeleteBackup(
        string fileName
    )
    {
        var path =
            GetBackupPath(fileName);

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(
                "Backup file was not found."
            );
        }

        File.Delete(path);
    }

    // ---------------------------------
    // Restore
    // ---------------------------------

    public async Task<RestoreResult>
        RestoreAsync(
            Stream uploadedFile,
            string originalFileName
        )
    {
        if (
            uploadedFile == null ||
            !uploadedFile.CanRead
        )
        {
            throw new InvalidOperationException(
                "Invalid backup file."
            );
        }

        if (
            !originalFileName.EndsWith(
                ".db",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            throw new InvalidOperationException(
                "Only .db backup files can be restored."
            );
        }

        var backupDirectory =
            GetBackupDirectory();

        var temporaryFile =
            Path.Combine(
                backupDirectory,
                $"restore-upload-{Guid.NewGuid():N}.db"
            );

        try
        {
            // Save upload temporarily

            await using (
                var output =
                    new FileStream(
                        temporaryFile,
                        FileMode.CreateNew,
                        FileAccess.Write,
                        FileShare.None
                    )
            )
            {
                await uploadedFile.CopyToAsync(
                    output
                );
            }

            // Validate SQLite DB

            await ValidateDatabaseAsync(
                temporaryFile
            );

            // Safety backup before restore

            var safetyBackup =
                await CreateBackupAsync(
                    "before-restore"
                );

            // Restore using SQLite backup API

            await RestoreDatabaseFromFileAsync(
                temporaryFile
            );

            return new RestoreResult
            {
                Success = true,

                SafetyBackupFileName =
                    safetyBackup.FileName
            };
        }
        finally
        {
            if (
                File.Exists(
                    temporaryFile
                )
            )
            {
                try
                {
                    File.Delete(
                        temporaryFile
                    );
                }
                catch
                {
                    // Do not fail restore
                    // because temp cleanup failed.
                }
            }
        }
    }

    // ---------------------------------
    // Validate SQLite database
    // ---------------------------------

    private static async Task
        ValidateDatabaseAsync(
            string databasePath
        )
    {
        var connectionString =
            new SqliteConnectionStringBuilder
            {
                DataSource =
                    databasePath,

                Mode =
                    SqliteOpenMode.ReadOnly
            }.ToString();

        await using var connection =
            new SqliteConnection(
                connectionString
            );

        try
        {
            await connection.OpenAsync();

            await using var command =
                connection.CreateCommand();

            command.CommandText =
                "PRAGMA integrity_check;";

            var result =
                Convert.ToString(
                    await command
                        .ExecuteScalarAsync()
                );

            if (
                !string.Equals(
                    result,
                    "ok",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                throw new InvalidOperationException(
                    "The uploaded database failed its integrity check."
                );
            }

            // Make sure this looks like
            // our clinic database.

            command.CommandText = """
                SELECT COUNT(*)
                FROM sqlite_master
                WHERE type = 'table'
                AND name = 'Patients';
                """;

            var patientsTable =
                Convert.ToInt32(
                    await command
                        .ExecuteScalarAsync()
                );

            if (patientsTable == 0)
            {
                throw new InvalidOperationException(
                    "This does not appear to be a valid clinic database backup."
                );
            }
        }
        catch (
            InvalidOperationException
        )
        {
            throw;
        }
        catch (Exception exception)
        {
            throw new InvalidOperationException(
                "The selected file is not a valid SQLite clinic database.",
                exception
            );
        }
    }

    // ---------------------------------
    // Restore DB
    // ---------------------------------

    private async Task
        RestoreDatabaseFromFileAsync(
            string backupPath
        )
    {
        var databasePath =
            GetDatabasePath();

        var sourceConnectionString =
            new SqliteConnectionStringBuilder
            {
                DataSource =
                    backupPath,

                Mode =
                    SqliteOpenMode.ReadOnly
            }.ToString();

        var destinationConnectionString =
            new SqliteConnectionStringBuilder
            {
                DataSource =
                    databasePath,

                Mode =
                    SqliteOpenMode.ReadWriteCreate
            }.ToString();

        // Clear pooled SQLite
        // connections first.

        SqliteConnection.ClearAllPools();

        await using var source =
            new SqliteConnection(
                sourceConnectionString
            );

        await using var destination =
            new SqliteConnection(
                destinationConnectionString
            );

        await source.OpenAsync();

        await destination.OpenAsync();

        source.BackupDatabase(
            destination
        );

        SqliteConnection.ClearAllPools();
    }

    // ---------------------------------
    // Helpers
    // ---------------------------------

    private static string SanitizePrefix(
        string prefix
    )
    {
        var invalid =
            Path.GetInvalidFileNameChars();

        var cleaned =
            new string(
                prefix
                    .Where(
                        character =>
                            !invalid.Contains(
                                character
                            )
                    )
                    .ToArray()
            );

        return string.IsNullOrWhiteSpace(
            cleaned
        )
            ? "clinic-backup"
            : cleaned;
    }
}

public class BackupInfo
{
    public string FileName { get; set; } =
        string.Empty;

    public long SizeBytes { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class RestoreResult
{
    public bool Success { get; set; }

    public string
        SafetyBackupFileName
    {
        get;
        set;
    } = string.Empty;
}