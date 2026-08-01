using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly ClinicDbContext _context;

    private static readonly HashSet<string> ValidStatuses =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "Scheduled",
            "Waiting",
            "In Progress",
            "Completed",
            "Cancelled"
        };

    public AppointmentsController(ClinicDbContext context)
    {
        _context = context;
    }

    // GET: api/appointments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetAppointments()
    {
        var appointments = await _context.Appointments
            .AsNoTracking()
            .Include(appointment => appointment.Patient)
            .OrderBy(appointment => appointment.AppointmentDate)
            .ThenBy(appointment => appointment.AppointmentTime)
            .ToListAsync();

        return Ok(
            appointments.Select(ToResponseDto)
        );
    }

    // GET: api/appointments/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentResponseDto>> GetAppointment(
        int id
    )
    {
        var appointment = await _context.Appointments
            .AsNoTracking()
            .Include(appointment => appointment.Patient)
            .FirstOrDefaultAsync(
                appointment => appointment.Id == id
            );

        if (appointment == null)
        {
            return NotFound();
        }

        return Ok(
            ToResponseDto(appointment)
        );
    }

    // POST: api/appointments
    [HttpPost]
    public async Task<ActionResult<AppointmentResponseDto>> CreateAppointment(
        CreateAppointmentDto dto
    )
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(
                patient => patient.Id == dto.PatientId
            );

        if (patient == null)
        {
            return BadRequest(
                "Selected patient does not exist."
            );
        }

        if (
            dto.AppointmentDate <
            DateOnly.FromDateTime(DateTime.Today)
        )
        {
            return BadRequest(
                "Appointment date cannot be in the past."
            );
        }

        var normalizedStatus =
            NormalizeStatus(dto.Status);

        if (normalizedStatus == null)
        {
            return BadRequest(
                "Invalid appointment status."
            );
        }

        var appointment = new Appointment
        {
            PatientId = dto.PatientId,

            AppointmentDate =
                dto.AppointmentDate,

            AppointmentTime =
                dto.AppointmentTime,

            Type =
                dto.Type.Trim(),

            Doctor =
                dto.Doctor.Trim(),

            Reason =
                Clean(dto.Reason),

            Status =
                normalizedStatus,

            CreatedAt =
                DateTime.UtcNow,

            UpdatedAt =
                DateTime.UtcNow,

            Patient =
                patient
        };

        _context.Appointments.Add(
            appointment
        );

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAppointment),
            new
            {
                id = appointment.Id
            },
            ToResponseDto(appointment)
        );
    }

    // PUT: api/appointments/1
    [HttpPut("{id:int}")]
    public async Task<ActionResult<AppointmentResponseDto>> UpdateAppointment(
        int id,
        UpdateAppointmentDto dto
    )
    {
        var appointment =
            await _context.Appointments
                .Include(
                    appointment =>
                        appointment.Patient
                )
                .FirstOrDefaultAsync(
                    appointment =>
                        appointment.Id == id
                );

        if (appointment == null)
        {
            return NotFound();
        }

        var patient =
            await _context.Patients
                .FirstOrDefaultAsync(
                    patient =>
                        patient.Id ==
                        dto.PatientId
                );

        if (patient == null)
        {
            return BadRequest(
                "Selected patient does not exist."
            );
        }

        var normalizedStatus =
            NormalizeStatus(dto.Status);

        if (normalizedStatus == null)
        {
            return BadRequest(
                "Invalid appointment status."
            );
        }

        appointment.PatientId =
            dto.PatientId;

        appointment.Patient =
            patient;

        appointment.AppointmentDate =
            dto.AppointmentDate;

        appointment.AppointmentTime =
            dto.AppointmentTime;

        appointment.Type =
            dto.Type.Trim();

        appointment.Doctor =
            dto.Doctor.Trim();

        appointment.Reason =
            Clean(dto.Reason);

        appointment.Status =
            normalizedStatus;

        appointment.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(
            ToResponseDto(appointment)
        );
    }

    // PATCH: api/appointments/1/status
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<AppointmentResponseDto>> UpdateAppointmentStatus(
        int id,
        UpdateAppointmentStatusDto dto
    )
    {
        var appointment =
            await _context.Appointments
                .Include(
                    appointment =>
                        appointment.Patient
                )
                .FirstOrDefaultAsync(
                    appointment =>
                        appointment.Id == id
                );

        if (appointment == null)
        {
            return NotFound(
                "Appointment not found."
            );
        }

        var newStatus =
            NormalizeStatus(dto.Status);

        if (newStatus == null)
        {
            return BadRequest(
                "Invalid appointment status."
            );
        }

        if (
            string.Equals(
                appointment.Status,
                newStatus,
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            return Ok(
                ToResponseDto(appointment)
            );
        }

        if (
            !CanChangeStatus(
                appointment.Status,
                newStatus
            )
        )
        {
            return BadRequest(
                $"Appointment cannot be changed from '{appointment.Status}' to '{newStatus}'."
            );
        }

        appointment.Status =
            newStatus;

        appointment.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(
            ToResponseDto(appointment)
        );
    }

    private static bool CanChangeStatus(
        string currentStatus,
        string newStatus
    )
    {
        return currentStatus switch
        {
            "Scheduled" =>
                newStatus == "Waiting" ||
                newStatus == "In Progress" ||
                newStatus == "Cancelled",

            "Waiting" =>
                newStatus == "In Progress" ||
                newStatus == "Cancelled",

            "In Progress" =>
                newStatus == "Completed",

            "Completed" =>
                false,

            "Cancelled" =>
                false,

            _ =>
                false
        };
    }

    private static string? NormalizeStatus(
        string? status
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                status
            )
        )
        {
            return null;
        }

        var value = status.Trim();

        return ValidStatuses
            .FirstOrDefault(
                statusValue =>
                    string.Equals(
                        statusValue,
                        value,
                        StringComparison.OrdinalIgnoreCase
                    )
            );
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

    private static AppointmentResponseDto ToResponseDto(
        Appointment appointment
    )
    {
        return new AppointmentResponseDto
        {
            Id =
                appointment.Id,

            PatientId =
                appointment.PatientId,

            PatientUhid =
                appointment.Patient.Uhid,

            PatientName =
                appointment.Patient.Name,

            PatientMobile =
                appointment.Patient.Mobile,

            AppointmentDate =
                appointment.AppointmentDate,

            AppointmentTime =
                appointment.AppointmentTime,

            Type =
                appointment.Type,

            Doctor =
                appointment.Doctor,

            Reason =
                appointment.Reason,

            Status =
                appointment.Status,

            CreatedAt =
                appointment.CreatedAt,

            UpdatedAt =
                appointment.UpdatedAt
        };
    }
}