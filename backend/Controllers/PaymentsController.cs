using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public PaymentsController(
        ClinicDbContext context
    )
    {
        _context = context;
    }

    // ---------------------------------
    // GET: api/payments
    // ---------------------------------

    [HttpGet]
    public async Task<
        ActionResult<IEnumerable<PaymentResponseDto>>
    > GetPayments()
    {
        var payments =
            await _context.Payments
                .AsNoTracking()
                .Include(payment => payment.Bill)
                    .ThenInclude(bill => bill.Patient)
                .OrderByDescending(
                    payment => payment.PaymentDate
                )
                .ThenByDescending(
                    payment => payment.Id
                )
                .ToListAsync();

        return Ok(
            payments.Select(ToResponseDto)
        );
    }

    // ---------------------------------
    // GET: api/payments/1
    // ---------------------------------

    [HttpGet("{id:int}")]
    public async Task<
        ActionResult<PaymentResponseDto>
    > GetPayment(int id)
    {
        var payment =
            await _context.Payments
                .AsNoTracking()
                .Include(payment => payment.Bill)
                    .ThenInclude(bill => bill.Patient)
                .FirstOrDefaultAsync(
                    payment =>
                        payment.Id == id
                );

        if (payment == null)
        {
            return NotFound();
        }

        return Ok(
            ToResponseDto(payment)
        );
    }

    // ---------------------------------
    // POST: api/payments
    // ---------------------------------

    [HttpPost]
    public async Task<
        ActionResult<PaymentResponseDto>
    > CreatePayment(
        CreatePaymentDto dto
    )
    {
        var bill =
            await _context.Bills
                .Include(bill => bill.Patient)
                .FirstOrDefaultAsync(
                    bill =>
                        bill.Id == dto.BillId
                );

        if (bill == null)
        {
            return BadRequest(
                "Selected bill does not exist."
            );
        }

        if (bill.Balance <= 0)
        {
            return BadRequest(
                "This bill is already fully paid."
            );
        }

        if (dto.Amount <= 0)
        {
            return BadRequest(
                "Payment amount must be greater than zero."
            );
        }

        if (dto.Amount > bill.Balance)
        {
            return BadRequest(
                $"Payment cannot exceed the outstanding balance of ₹{bill.Balance:0.00}."
            );
        }

        var method =
            dto.Method.Trim();

        var allowedMethods =
            new[]
            {
                "Cash",
                "UPI",
                "Card",
                "Bank Transfer"
            };

        if (
            !allowedMethods.Contains(
                method
            )
        )
        {
            return BadRequest(
                "Invalid payment method."
            );
        }

        // ---------------------------------
        // Generate receipt number
        // ---------------------------------

        var receiptNumber =
            await GenerateReceiptNumber();

        // ---------------------------------
        // Create payment
        // ---------------------------------

        var payment =
            new Payment
            {
                ReceiptNumber =
                    receiptNumber,

                BillId =
                    bill.Id,

                Amount =
                    dto.Amount,

                Method =
                    method,

                Reference =
                    Clean(
                        dto.Reference
                    ),

                Notes =
                    Clean(
                        dto.Notes
                    ),

                PaymentDate =
                    DateTime.UtcNow,

                CreatedAt =
                    DateTime.UtcNow,

                Bill =
                    bill
            };

        // ---------------------------------
        // Update bill totals
        // ---------------------------------

        bill.Paid +=
            dto.Amount;

        bill.Balance =
            bill.Total -
            bill.Paid;

        if (bill.Balance < 0)
        {
            bill.Balance = 0;
        }

        if (bill.Balance == 0)
        {
            bill.Status =
                "Paid";
        }
        else if (bill.Paid > 0)
        {
            bill.Status =
                "Partially Paid";
        }
        else
        {
            bill.Status =
                "Unpaid";
        }

        bill.UpdatedAt =
            DateTime.UtcNow;

        _context.Payments.Add(
            payment
        );

        /*
         * Payment,
         * bill update,
         * and receipt counter
         * are committed together.
         */

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetPayment),
            new
            {
                id = payment.Id
            },
            ToResponseDto(payment)
        );
    }

    // ---------------------------------
    // Generate Receipt Number
    // ---------------------------------

    private async Task<string>
        GenerateReceiptNumber()
    {
        var settings =
            await _context.ClinicSettings
                .FirstOrDefaultAsync();

        var year =
            DateTime.Today.Year;

        var prefix =
            string.IsNullOrWhiteSpace(
                settings?.ReceiptPrefix
            )
                ? $"REC-{year}"
                : settings
                    .ReceiptPrefix
                    .Trim();

        /*
         * Read the configured next number.
         */

        var configuredNext =
            settings?.NextReceiptNumber
            ?? 1;

        /*
         * Protect existing databases.
         *
         * If old payments already exist
         * before receipt numbering was
         * introduced, we don't want to
         * start again from 0001.
         */

        var highestPaymentId =
            await _context.Payments
                .AsNoTracking()
                .MaxAsync(
                    payment =>
                        (int?)payment.Id
                )
            ?? 0;

        var nextNumber =
            Math.Max(
                configuredNext,
                highestPaymentId + 1
            );

        /*
         * Advance the configured counter.
         *
         * SaveChanges in CreatePayment()
         * commits this together with the
         * new payment.
         */

        if (settings != null)
        {
            settings.NextReceiptNumber =
                nextNumber + 1;

            settings.UpdatedAt =
                DateTime.UtcNow;
        }

        return
            $"{prefix}-{nextNumber:D4}";
    }

    // ---------------------------------
    // Helpers
    // ---------------------------------

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

    private static PaymentResponseDto
        ToResponseDto(
            Payment payment
        )
    {
        return new PaymentResponseDto
        {
            Id =
                payment.Id,

            ReceiptNumber =
                payment.ReceiptNumber,

            BillId =
                payment.BillId,

            BillNumber =
                payment.Bill.BillNumber,

            PatientId =
                payment.Bill.PatientId,

            PatientName =
                payment.Bill.Patient.Name,

            PatientUhid =
                payment.Bill.Patient.Uhid,

            Amount =
                payment.Amount,

            Method =
                payment.Method,

            Reference =
                payment.Reference,

            Notes =
                payment.Notes,

            PaymentDate =
                payment.PaymentDate,

            CreatedAt =
                payment.CreatedAt
        };
    }
}