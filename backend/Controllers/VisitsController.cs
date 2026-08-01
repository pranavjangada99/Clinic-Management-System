using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisitsController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public VisitsController(
        ClinicDbContext context
    )
    {
        _context = context;
    }

    // GET: api/visits
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VisitResponseDto>>> GetVisits()
    {
        var visits = await _context.Visits
            .AsNoTracking()
            .Include(visit => visit.Patient)
            .Include(visit => visit.Medicines)
            .OrderByDescending(visit => visit.VisitDate)
            .ThenByDescending(visit => visit.VisitTime)
            .ToListAsync();

        return Ok(
            visits.Select(ToResponseDto)
        );
    }

    // GET: api/visits/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<VisitResponseDto>> GetVisit(
        int id
    )
    {
        var visit = await _context.Visits
            .AsNoTracking()
            .Include(visit => visit.Patient)
            .Include(visit => visit.Medicines)
            .FirstOrDefaultAsync(
                visit => visit.Id == id
            );

        if (visit == null)
        {
            return NotFound(
                "Visit not found."
            );
        }

        return Ok(
            ToResponseDto(visit)
        );
    }

    // POST: api/visits
    [HttpPost]
    public async Task<ActionResult<VisitResponseDto>> CreateVisit(
        CreateVisitDto dto
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

        Appointment? appointment = null;

        /*
         * Appointment is optional because we also support
         * walk-in consultations.
         */
        if (dto.AppointmentId.HasValue)
        {
            appointment = await _context.Appointments
                .FirstOrDefaultAsync(
                    appointment =>
                        appointment.Id ==
                        dto.AppointmentId.Value
                );

            if (appointment == null)
            {
                return BadRequest(
                    "Selected appointment does not exist."
                );
            }

            /*
             * Very important:
             * The appointment must belong to the same patient.
             */
            if (
                appointment.PatientId !=
                dto.PatientId
            )
            {
                return BadRequest(
                    "The selected appointment does not belong to this patient."
                );
            }

            /*
             * Prevent two visits from being created
             * for the same appointment.
             */
            var visitAlreadyExists =
                await _context.Visits
                    .AnyAsync(
                        visit =>
                            visit.AppointmentId ==
                            dto.AppointmentId.Value
                    );

            if (visitAlreadyExists)
            {
                return Conflict(
                    "A visit already exists for this appointment."
                );
            }

            if (
                appointment.Status ==
                "Cancelled"
            )
            {
                return BadRequest(
                    "A consultation cannot be started for a cancelled appointment."
                );
            }

            if (
                appointment.Status ==
                "Completed"
            )
            {
                return BadRequest(
                    "This appointment has already been completed."
                );
            }
        }

        if (
            dto.FollowUpDate.HasValue &&
            dto.FollowUpDate.Value <
            dto.VisitDate
        )
        {
            return BadRequest(
                "Follow-up date cannot be before the visit date."
            );
        }

        var visit = new Visit
        {
            PatientId =
                dto.PatientId,

            Patient =
                patient,

            AppointmentId =
                dto.AppointmentId,

            Appointment =
                appointment,

            VisitDate =
                dto.VisitDate,

            VisitTime =
                dto.VisitTime,

            Doctor =
                dto.Doctor.Trim(),

            ChiefComplaints =
                dto.ChiefComplaints.Trim(),

            Symptoms =
                Clean(dto.Symptoms),

            Diagnosis =
                Clean(dto.Diagnosis),

            ClinicalNotes =
                Clean(dto.ClinicalNotes),

            Advice =
                Clean(dto.Advice),

            FollowUpDate =
                dto.FollowUpDate,

            /*
             * Once the doctor starts a consultation,
             * the visit is considered In Progress.
             */
            Status =
                "In Progress",

            CreatedAt =
                DateTime.UtcNow,

            UpdatedAt =
                DateTime.UtcNow
        };

        foreach (
            var medicineDto in dto.Medicines
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    medicineDto.Name
                )
            )
            {
                continue;
            }

            visit.Medicines.Add(
                CreateMedicine(
                    medicineDto
                )
            );
        }

        /*
         * Keep appointment and visit synchronized.
         */
        if (appointment != null)
        {
            appointment.Status =
                "In Progress";

            appointment.UpdatedAt =
                DateTime.UtcNow;
        }

        _context.Visits.Add(visit);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetVisit),
            new
            {
                id = visit.Id
            },
            ToResponseDto(visit)
        );
    }

    // PUT: api/visits/1
    [HttpPut("{id:int}")]
    public async Task<ActionResult<VisitResponseDto>> UpdateVisit(
        int id,
        UpdateVisitDto dto
    )
    {
        var visit = await _context.Visits
            .Include(visit => visit.Patient)
            .Include(visit => visit.Medicines)
            .FirstOrDefaultAsync(
                visit => visit.Id == id
            );

        if (visit == null)
        {
            return NotFound(
                "Visit not found."
            );
        }

        if (
            visit.Status ==
            "Completed"
        )
        {
            return BadRequest(
                "A completed visit cannot be edited."
            );
        }

        if (
            dto.FollowUpDate.HasValue &&
            dto.FollowUpDate.Value <
            visit.VisitDate
        )
        {
            return BadRequest(
                "Follow-up date cannot be before the visit date."
            );
        }

        visit.Doctor =
            dto.Doctor.Trim();

        visit.ChiefComplaints =
            dto.ChiefComplaints.Trim();

        visit.Symptoms =
            Clean(dto.Symptoms);

        visit.Diagnosis =
            Clean(dto.Diagnosis);

        visit.ClinicalNotes =
            Clean(dto.ClinicalNotes);

        visit.Advice =
            Clean(dto.Advice);

        visit.FollowUpDate =
            dto.FollowUpDate;

        visit.UpdatedAt =
            DateTime.UtcNow;

        /*
         * For now, replacing medicines is simpler and safer
         * than trying to individually compare every medicine row.
         */
        _context.VisitMedicines.RemoveRange(
            visit.Medicines
        );

        visit.Medicines.Clear();

        foreach (
            var medicineDto in dto.Medicines
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    medicineDto.Name
                )
            )
            {
                continue;
            }

            visit.Medicines.Add(
                CreateMedicine(
                    medicineDto
                )
            );
        }

        await _context.SaveChangesAsync();

        return Ok(
            ToResponseDto(visit)
        );
    }

    // PATCH: api/visits/1/complete
    [HttpPatch("{id:int}/complete")]
    public async Task<ActionResult<VisitResponseDto>> CompleteVisit(
        int id
    )
    {
        var visit = await _context.Visits
            .Include(visit => visit.Patient)
            .Include(visit => visit.Medicines)
            .Include(visit => visit.Appointment)
            .FirstOrDefaultAsync(
                visit => visit.Id == id
            );

        if (visit == null)
        {
            return NotFound(
                "Visit not found."
            );
        }

        if (
            visit.Status ==
            "Completed"
        )
        {
            return Ok(
                ToResponseDto(visit)
            );
        }

        visit.Status =
            "Completed";

        visit.UpdatedAt =
            DateTime.UtcNow;

        /*
         * If this consultation came from an appointment,
         * complete that appointment too.
         */
        if (
            visit.Appointment != null
        )
        {
            visit.Appointment.Status =
                "Completed";

            visit.Appointment.UpdatedAt =
                DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(
            ToResponseDto(visit)
        );
    }

    private static VisitMedicine CreateMedicine(
        VisitMedicineDto dto
    )
    {
        return new VisitMedicine
        {
            Name =
                dto.Name.Trim(),

            Potency =
                Clean(dto.Potency),

            Dose =
                Clean(dto.Dose),

            Frequency =
                Clean(dto.Frequency),

            Duration =
                Clean(dto.Duration),

            Instructions =
                Clean(dto.Instructions)
        };
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

    private static VisitResponseDto ToResponseDto(
        Visit visit
    )
    {
        return new VisitResponseDto
        {
            Id =
                visit.Id,

            PatientId =
                visit.PatientId,

            PatientUhid =
                visit.Patient.Uhid,

            PatientName =
                visit.Patient.Name,

            PatientMobile =
                visit.Patient.Mobile,

            AppointmentId =
                visit.AppointmentId,

            VisitDate =
                visit.VisitDate,

            VisitTime =
                visit.VisitTime,

            Doctor =
                visit.Doctor,

            ChiefComplaints =
                visit.ChiefComplaints,

            Symptoms =
                visit.Symptoms,

            Diagnosis =
                visit.Diagnosis,

            ClinicalNotes =
                visit.ClinicalNotes,

            Advice =
                visit.Advice,

            FollowUpDate =
                visit.FollowUpDate,

            Status =
                visit.Status,

            Medicines =
                visit.Medicines
                    .OrderBy(
                        medicine =>
                            medicine.Id
                    )
                    .Select(
                        medicine =>
                            new VisitMedicineResponseDto
                            {
                                Id =
                                    medicine.Id,

                                Name =
                                    medicine.Name,

                                Potency =
                                    medicine.Potency,

                                Dose =
                                    medicine.Dose,

                                Frequency =
                                    medicine.Frequency,

                                Duration =
                                    medicine.Duration,

                                Instructions =
                                    medicine.Instructions
                            }
                    )
                    .ToList(),

            CreatedAt =
                visit.CreatedAt,

            UpdatedAt =
                visit.UpdatedAt
        };
    }
}