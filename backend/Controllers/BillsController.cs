using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BillsController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public BillsController(
        ClinicDbContext context
    )
    {
        _context = context;
    }

    // GET: api/bills

    [HttpGet]
    public async Task<
        ActionResult<IEnumerable<BillResponseDto>>
    > GetBills()
    {
        var bills =
            await _context.Bills
                .AsNoTracking()
                .Include(
                    bill => bill.Patient
                )
                .Include(
                    bill => bill.Items
                )
                .OrderByDescending(
                    bill => bill.BillDate
                )
                .ThenByDescending(
                    bill => bill.Id
                )
                .ToListAsync();

        return Ok(
            bills.Select(ToResponseDto)
        );
    }

    // GET: api/bills/1

    [HttpGet("{id:int}")]
    public async Task<
        ActionResult<BillResponseDto>
    > GetBill(int id)
    {
        var bill =
            await _context.Bills
                .AsNoTracking()
                .Include(
                    bill => bill.Patient
                )
                .Include(
                    bill => bill.Items
                )
                .FirstOrDefaultAsync(
                    bill =>
                        bill.Id == id
                );

        if (bill == null)
        {
            return NotFound();
        }

        return Ok(
            ToResponseDto(bill)
        );
    }

    // POST: api/bills

    [HttpPost]
    public async Task<
        ActionResult<BillResponseDto>
    > CreateBill(
        CreateBillDto dto
    )
    {
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

        if (
            dto.Items == null ||
            dto.Items.Count == 0
        )
        {
            return BadRequest(
                "At least one bill item is required."
            );
        }

        if (
            dto.Items.Any(
                item =>
                    string.IsNullOrWhiteSpace(
                        item.Description
                    )
            )
        )
        {
            return BadRequest(
                "Every bill item must have a description."
            );
        }

        var subtotal =
            dto.Items.Sum(
                item =>
                    item.Quantity *
                    item.Rate
            );

        if (
            dto.Discount >
            subtotal
        )
        {
            return BadRequest(
                "Discount cannot be greater than subtotal."
            );
        }

        var total =
            subtotal -
            dto.Discount;

        if (dto.Paid > total)
        {
            return BadRequest(
                "Paid amount cannot be greater than bill total."
            );
        }

        var balance =
            total -
            dto.Paid;

        var status =
            CalculateStatus(
                total,
                dto.Paid,
                balance
            );

        var billNumber =
            await GenerateBillNumber();

        var bill =
            new Bill
            {
                BillNumber =
                    billNumber,

                PatientId =
                    patient.Id,

                Patient =
                    patient,

                BillDate =
                    dto.BillDate,

                Subtotal =
                    subtotal,

                Discount =
                    dto.Discount,

                Total =
                    total,

                Paid =
                    dto.Paid,

                Balance =
                    balance,

                Status =
                    status,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    DateTime.UtcNow,

                Items =
                    dto.Items
                        .Select(
                            item =>
                                new BillItem
                                {
                                    Description =
                                        item.Description
                                            .Trim(),

                                    Quantity =
                                        item.Quantity,

                                    Rate =
                                        item.Rate
                                }
                        )
                        .ToList()
            };

        _context.Bills.Add(
            bill
        );

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetBill),
            new
            {
                id = bill.Id
            },
            ToResponseDto(bill)
        );
    }

    // ---------------------------------
    // Generate invoice number
    // ---------------------------------

    private async Task<string>
        GenerateBillNumber()
    {
        var settings =
            await _context.ClinicSettings
                .FirstOrDefaultAsync();

        var year =
            DateTime.Today.Year;

        var prefix =
            string.IsNullOrWhiteSpace(
                settings?.InvoicePrefix
            )
                ? $"INV-{year}"
                : settings
                    .InvoicePrefix
                    .Trim();

        var prefixWithSeparator =
            $"{prefix}-";

        var existingNumbers =
            await _context.Bills
                .AsNoTracking()
                .Where(
                    bill =>
                        bill.BillNumber
                            .StartsWith(
                                prefixWithSeparator
                            )
                )
                .Select(
                    bill =>
                        bill.BillNumber
                )
                .ToListAsync();

        var highestExistingNumber =
            0;

        foreach (
            var billNumber
            in existingNumbers
        )
        {
            var numberPart =
                billNumber[
                    prefixWithSeparator.Length..
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
            settings?.NextInvoiceNumber
            ?? 1;

        var nextNumber =
            Math.Max(
                configuredNext,
                highestExistingNumber + 1
            );

        if (settings != null)
        {
            settings.NextInvoiceNumber =
                nextNumber + 1;

            settings.UpdatedAt =
                DateTime.UtcNow;
        }

        return
            $"{prefix}-{nextNumber:D4}";
    }

    private static string CalculateStatus(
        decimal total,
        decimal paid,
        decimal balance
    )
    {
        if (
            total == 0 ||
            balance == 0
        )
        {
            return "Paid";
        }

        if (paid > 0)
        {
            return "Partially Paid";
        }

        return "Unpaid";
    }

    private static BillResponseDto
        ToResponseDto(
            Bill bill
        )
    {
        return new BillResponseDto
        {
            Id =
                bill.Id,

            BillNumber =
                bill.BillNumber,

            PatientId =
                bill.PatientId,

            PatientName =
                bill.Patient.Name,

            PatientUhid =
                bill.Patient.Uhid,

            PatientMobile =
                bill.Patient.Mobile,

            BillDate =
                bill.BillDate,

            Items =
                bill.Items
                    .OrderBy(
                        item => item.Id
                    )
                    .Select(
                        item =>
                            new BillItemResponseDto
                            {
                                Id =
                                    item.Id,

                                Description =
                                    item.Description,

                                Quantity =
                                    item.Quantity,

                                Rate =
                                    item.Rate,

                                Amount =
                                    item.Quantity *
                                    item.Rate
                            }
                    )
                    .ToList(),

            Subtotal =
                bill.Subtotal,

            Discount =
                bill.Discount,

            Total =
                bill.Total,

            Paid =
                bill.Paid,

            Balance =
                bill.Balance,

            Status =
                bill.Status,

            CreatedAt =
                bill.CreatedAt,

            UpdatedAt =
                bill.UpdatedAt
        };
    }
}