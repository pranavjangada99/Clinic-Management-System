using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public PatientsController(
        ClinicDbContext context
    )
    {
        _context = context;
    }

    // GET: api/patients

    [HttpGet]
    public async Task<
        ActionResult<IEnumerable<PatientResponseDto>>
    > GetPatients()
    {
        var patients =
            await _context.Patients
                .AsNoTracking()
                .OrderByDescending(
                    patient => patient.Id
                )
                .ToListAsync();

        return Ok(
            patients.Select(ToResponseDto)
        );
    }

    // GET: api/patients/1

    [HttpGet("{id:int}")]
    public async Task<
        ActionResult<PatientResponseDto>
    > GetPatient(int id)
    {
        var patient =
            await _context.Patients
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    patient =>
                        patient.Id == id
                );

        if (patient == null)
        {
            return NotFound();
        }

        return Ok(
            ToResponseDto(patient)
        );
    }

    // POST: api/patients

    [HttpPost]
    public async Task<
        ActionResult<PatientResponseDto>
    > CreatePatient(
        CreatePatientDto dto
    )
    {
        if (
            dto.DateOfBirth >
            DateOnly.FromDateTime(
                DateTime.Today
            )
        )
        {
            return BadRequest(
                "Date of birth cannot be in the future."
            );
        }

        var uhid =
            await GenerateNextUhid();

        var patient =
            new Patient
            {
                Uhid =
                    uhid,

                Name =
                    dto.Name.Trim(),

                DateOfBirth =
                    dto.DateOfBirth,

                Gender =
                    dto.Gender.Trim(),

                Mobile =
                    dto.Mobile.Trim(),

                AlternateMobile =
                    Clean(
                        dto.AlternateMobile
                    ),

                Email =
                    Clean(dto.Email),

                Address =
                    Clean(dto.Address),

                City =
                    Clean(dto.City),

                State =
                    Clean(dto.State),

                PinCode =
                    Clean(dto.PinCode),

                BloodGroup =
                    Clean(dto.BloodGroup),

                ReferredBy =
                    Clean(dto.ReferredBy),

                Notes =
                    Clean(dto.Notes),

                Status =
                    "Active",

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    DateTime.UtcNow
            };

        _context.Patients.Add(
            patient
        );

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetPatient),
            new
            {
                id = patient.Id
            },
            ToResponseDto(patient)
        );
    }

    // PUT: api/patients/1

    [HttpPut("{id:int}")]
    public async Task<
        ActionResult<PatientResponseDto>
    > UpdatePatient(
        int id,
        UpdatePatientDto dto
    )
    {
        var patient =
            await _context.Patients
                .FindAsync(id);

        if (patient == null)
        {
            return NotFound();
        }

        if (
            dto.DateOfBirth >
            DateOnly.FromDateTime(
                DateTime.Today
            )
        )
        {
            return BadRequest(
                "Date of birth cannot be in the future."
            );
        }

        patient.Name =
            dto.Name.Trim();

        patient.DateOfBirth =
            dto.DateOfBirth;

        patient.Gender =
            dto.Gender.Trim();

        patient.Mobile =
            dto.Mobile.Trim();

        patient.AlternateMobile =
            Clean(dto.AlternateMobile);

        patient.Email =
            Clean(dto.Email);

        patient.Address =
            Clean(dto.Address);

        patient.City =
            Clean(dto.City);

        patient.State =
            Clean(dto.State);

        patient.PinCode =
            Clean(dto.PinCode);

        patient.BloodGroup =
            Clean(dto.BloodGroup);

        patient.ReferredBy =
            Clean(dto.ReferredBy);

        patient.Notes =
            Clean(dto.Notes);

        patient.Status =
            dto.Status.Trim();

        patient.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(
            ToResponseDto(patient)
        );
    }

    // ---------------------------------
    // Generate UHID
    // ---------------------------------

    private async Task<string>
        GenerateNextUhid()
    {
        var settings =
            await _context.ClinicSettings
                .FirstOrDefaultAsync();

        var prefix =
            string.IsNullOrWhiteSpace(
                settings?.PatientUhidPrefix
            )
                ? "SMHC"
                : settings
                    .PatientUhidPrefix
                    .Trim();

        var existingUhids =
            await _context.Patients
                .AsNoTracking()
                .Where(
                    patient =>
                        patient.Uhid.StartsWith(
                            prefix + "-"
                        )
                )
                .Select(
                    patient =>
                        patient.Uhid
                )
                .ToListAsync();

        var highestExistingNumber =
            0;

        foreach (
            var existingUhid
            in existingUhids
        )
        {
            var prefixWithDash =
                $"{prefix}-";

            if (
                !existingUhid.StartsWith(
                    prefixWithDash
                )
            )
            {
                continue;
            }

            var numberPart =
                existingUhid[
                    prefixWithDash.Length..
                ];

            if (
                int.TryParse(
                    numberPart,
                    out var number
                )
            )
            {
                highestExistingNumber =
                    Math.Max(
                        highestExistingNumber,
                        number
                    );
            }
        }

        var configuredNext =
            settings?.NextPatientNumber
            ?? 1;

        var nextNumber =
            Math.Max(
                configuredNext,
                highestExistingNumber + 1
            );

        if (settings != null)
        {
            settings.NextPatientNumber =
                nextNumber + 1;

            settings.UpdatedAt =
                DateTime.UtcNow;
        }

        return
            $"{prefix}-{nextNumber:D4}";
    }

    private static int CalculateAge(
        DateOnly dateOfBirth
    )
    {
        var today =
            DateOnly.FromDateTime(
                DateTime.Today
            );

        var age =
            today.Year -
            dateOfBirth.Year;

        if (
            dateOfBirth >
            today.AddYears(-age)
        )
        {
            age--;
        }

        return age;
    }

    private static string? Clean(
        string? value
    )
    {
        return string.IsNullOrWhiteSpace(
            value
        )
            ? null
            : value.Trim();
    }

    private static PatientResponseDto
        ToResponseDto(
            Patient patient
        )
    {
        return new PatientResponseDto
        {
            Id =
                patient.Id,

            Uhid =
                patient.Uhid,

            Name =
                patient.Name,

            DateOfBirth =
                patient.DateOfBirth,

            Age =
                CalculateAge(
                    patient.DateOfBirth
                ),

            Gender =
                patient.Gender,

            Mobile =
                patient.Mobile,

            AlternateMobile =
                patient.AlternateMobile,

            Email =
                patient.Email,

            Address =
                patient.Address,

            City =
                patient.City,

            State =
                patient.State,

            PinCode =
                patient.PinCode,

            BloodGroup =
                patient.BloodGroup,

            ReferredBy =
                patient.ReferredBy,

            Notes =
                patient.Notes,

            Status =
                patient.Status,

            CreatedAt =
                patient.CreatedAt,

            UpdatedAt =
                patient.UpdatedAt
        };
    }
}