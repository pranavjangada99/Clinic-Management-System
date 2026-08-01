using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ClinicDbContext : DbContext
{
    public ClinicDbContext(
        DbContextOptions<ClinicDbContext> options
    ) : base(options)
    {
    }

    public DbSet<Patient> Patients =>
        Set<Patient>();

    public DbSet<Appointment> Appointments =>
        Set<Appointment>();

    public DbSet<Visit> Visits =>
        Set<Visit>();

    public DbSet<VisitMedicine> VisitMedicines =>
        Set<VisitMedicine>();

    public DbSet<Bill> Bills =>
    Set<Bill>();

    public DbSet<BillItem> BillItems =>
    Set<BillItem>();

    public DbSet<Payment> Payments =>
    Set<Payment>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder
    )
    {
        base.OnModelCreating(modelBuilder);

        // -------------------------
        // Patient
        // -------------------------

        modelBuilder.Entity<Patient>()
            .HasIndex(patient => patient.Uhid)
            .IsUnique();

        modelBuilder.Entity<Patient>()
            .HasIndex(patient => patient.Mobile);

        // -------------------------
        // Appointment
        // -------------------------

        modelBuilder.Entity<Appointment>()
            .HasOne(appointment => appointment.Patient)
            .WithMany()
            .HasForeignKey(appointment => appointment.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Appointment>()
            .HasIndex(appointment => appointment.PatientId);

        modelBuilder.Entity<Appointment>()
            .HasIndex(appointment => appointment.AppointmentDate);

        // -------------------------
        // Visit
        // -------------------------

        modelBuilder.Entity<Visit>()
            .HasOne(visit => visit.Patient)
            .WithMany()
            .HasForeignKey(visit => visit.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Visit>()
            .HasOne(visit => visit.Appointment)
            .WithMany()
            .HasForeignKey(visit => visit.AppointmentId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Visit>()
            .HasIndex(visit => visit.PatientId);

        modelBuilder.Entity<Visit>()
            .HasIndex(visit => visit.AppointmentId);

        modelBuilder.Entity<Visit>()
            .HasIndex(visit => visit.VisitDate);

        // -------------------------
        // Visit Medicine
        // -------------------------

        modelBuilder.Entity<VisitMedicine>()
            .HasOne(medicine => medicine.Visit)
            .WithMany(visit => visit.Medicines)
            .HasForeignKey(medicine => medicine.VisitId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VisitMedicine>()
            .HasIndex(medicine => medicine.VisitId);

        // Bill

        modelBuilder.Entity<Bill>()
            .HasIndex(bill => bill.BillNumber)
            .IsUnique();

        modelBuilder.Entity<Bill>()
            .HasIndex(bill => bill.PatientId);

        modelBuilder.Entity<Bill>()
            .HasIndex(bill => bill.BillDate);

        modelBuilder.Entity<Bill>()
            .HasOne(bill => bill.Patient)
            .WithMany()
            .HasForeignKey(bill => bill.PatientId)
            .OnDelete(DeleteBehavior.Restrict);


        // Bill Item

        modelBuilder.Entity<BillItem>()
            .HasOne(item => item.Bill)
            .WithMany(bill => bill.Items)
            .HasForeignKey(item => item.BillId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BillItem>()
            .HasIndex(item => item.BillId);

        // Payment

        modelBuilder.Entity<Payment>()
            .HasOne(payment => payment.Bill)
            .WithMany()
            .HasForeignKey(payment => payment.BillId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasIndex(payment => payment.BillId);

        modelBuilder.Entity<Payment>()
            .Property(payment => payment.Amount)
            .HasPrecision(18, 2);
    }
}