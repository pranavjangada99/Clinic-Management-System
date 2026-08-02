using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/clinic-settings")]
public class ClinicSettingsController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public ClinicSettingsController(
        ClinicDbContext context
    )
    {
        _context = context;
    }

    // ---------------------------------
    // GET: api/clinic-settings
    // ---------------------------------

    [HttpGet]
    public async Task<ActionResult<ClinicSettings>> Get()
    {
        var settings =
            await _context.ClinicSettings
                .FirstOrDefaultAsync();

        if (settings == null)
        {
            settings =
                await CreateDefaultSettings();
        }

        return Ok(settings);
    }

    // ---------------------------------
    // PUT: api/clinic-settings
    // ---------------------------------

    [HttpPut]
    public async Task<ActionResult<ClinicSettings>> Update(
        ClinicSettings request
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                request.ClinicName
            )
        )
        {
            return BadRequest(
                "Clinic name is required."
            );
        }

        if (
            string.IsNullOrWhiteSpace(
                request.DoctorName
            )
        )
        {
            return BadRequest(
                "Doctor name is required."
            );
        }

        if (
            string.IsNullOrWhiteSpace(
                request.PatientUhidPrefix
            )
        )
        {
            return BadRequest(
                "Patient UHID prefix is required."
            );
        }

        if (
            string.IsNullOrWhiteSpace(
                request.InvoicePrefix
            )
        )
        {
            return BadRequest(
                "Invoice prefix is required."
            );
        }

        if (
            string.IsNullOrWhiteSpace(
                request.ReceiptPrefix
            )
        )
        {
            return BadRequest(
                "Receipt prefix is required."
            );
        }

        if (request.NextPatientNumber < 1)
        {
            return BadRequest(
                "Next patient number must be at least 1."
            );
        }

        if (request.NextInvoiceNumber < 1)
        {
            return BadRequest(
                "Next invoice number must be at least 1."
            );
        }

        if (request.NextReceiptNumber < 1)
        {
            return BadRequest(
                "Next receipt number must be at least 1."
            );
        }

        var settings =
            await _context.ClinicSettings
                .FirstOrDefaultAsync();

        if (settings == null)
        {
            settings =
                new ClinicSettings
                {
                    CreatedAt =
                        DateTime.UtcNow
                };

            _context.ClinicSettings.Add(
                settings
            );
        }

        // Clinic

        settings.ClinicName =
            request.ClinicName.Trim();

        settings.ClinicPhone =
            Clean(request.ClinicPhone);

        settings.ClinicEmail =
            Clean(request.ClinicEmail);

        settings.Address =
            Clean(request.Address);

        settings.City =
            Clean(request.City);

        settings.State =
            Clean(request.State);

        settings.PinCode =
            Clean(request.PinCode);

        // Doctor

        settings.DoctorName =
            request.DoctorName.Trim();

        settings.Qualification =
            Clean(request.Qualification);

        settings.RegistrationNumber =
            Clean(
                request.RegistrationNumber
            );

        settings.Specialisation =
            Clean(request.Specialisation);

        settings.DoctorPhone =
            Clean(request.DoctorPhone);

        settings.DoctorEmail =
            Clean(request.DoctorEmail);

        // Consultation

        settings.DefaultConsultationFee =
            request.DefaultConsultationFee;

        settings.DefaultFollowUpFee =
            request.DefaultFollowUpFee;

        settings.AppointmentDurationMinutes =
            request.AppointmentDurationMinutes;

        settings.DefaultFollowUpDays =
            request.DefaultFollowUpDays;

        settings.EnableAppointmentReminders =
            request.EnableAppointmentReminders;

        settings.AllowSameDayAppointments =
            request.AllowSameDayAppointments;

        // Billing

        settings.Currency =
            string.IsNullOrWhiteSpace(
                request.Currency
            )
                ? "INR"
                : request.Currency.Trim();

        settings.ReceiptFooter =
            request.ReceiptFooter ?? "";

        settings.InvoiceFooter =
            request.InvoiceFooter ?? "";

        settings.AllowPartialPayments =
            request.AllowPartialPayments;

        settings.PrintReceiptAfterPayment =
            request.PrintReceiptAfterPayment;

        settings.ShowOutstandingBalance =
            request.ShowOutstandingBalance;

        // Numbering

        settings.PatientUhidPrefix =
            request.PatientUhidPrefix.Trim();

        settings.NextPatientNumber =
            request.NextPatientNumber;

        settings.InvoicePrefix =
            request.InvoicePrefix.Trim();

        settings.NextInvoiceNumber =
            request.NextInvoiceNumber;

        settings.ReceiptPrefix =
            request.ReceiptPrefix.Trim();

        settings.NextReceiptNumber =
            request.NextReceiptNumber;

        settings.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(settings);
    }

    // ---------------------------------
    // Create default settings
    // ---------------------------------

    private async Task<ClinicSettings>
        CreateDefaultSettings()
    {
        var nextPatientNumber =
            (await _context.Patients
                .MaxAsync(
                    patient =>
                        (int?)patient.Id
                ) ?? 0) + 1;

        var nextInvoiceNumber =
            (await _context.Bills
                .MaxAsync(
                    bill =>
                        (int?)bill.Id
                ) ?? 0) + 1;

        var nextReceiptNumber =
            (await _context.Payments
                .MaxAsync(
                    payment =>
                        (int?)payment.Id
                ) ?? 0) + 1;

        var year =
            DateTime.Today.Year;

        var settings =
            new ClinicSettings
            {
                ClinicName =
                    "Shree Mahavir Homoeopathic Clinic",

                DoctorName =
                    "Dr. Pranav",

                DefaultConsultationFee =
                    500,

                DefaultFollowUpFee =
                    300,

                AppointmentDurationMinutes =
                    30,

                DefaultFollowUpDays =
                    15,

                EnableAppointmentReminders =
                    true,

                AllowSameDayAppointments =
                    true,

                Currency =
                    "INR",

                ReceiptFooter =
                    "Thank you for your payment.",

                InvoiceFooter =
                    "Thank you for visiting.",

                AllowPartialPayments =
                    true,

                PrintReceiptAfterPayment =
                    true,

                ShowOutstandingBalance =
                    true,

                PatientUhidPrefix =
                    "SMHC",

                NextPatientNumber =
                    nextPatientNumber,

                InvoicePrefix =
                    $"INV-{year}",

                NextInvoiceNumber =
                    nextInvoiceNumber,

                ReceiptPrefix =
                    $"REC-{year}",

                NextReceiptNumber =
                    nextReceiptNumber,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    DateTime.UtcNow
            };

        _context.ClinicSettings.Add(
            settings
        );

        await _context.SaveChangesAsync();

        return settings;
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
}