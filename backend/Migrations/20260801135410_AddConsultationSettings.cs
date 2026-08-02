using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddConsultationSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowSameDayAppointments",
                table: "ClinicSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "AppointmentDurationMinutes",
                table: "ClinicSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "DefaultConsultationFee",
                table: "ClinicSettings",
                type: "TEXT",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "DefaultFollowUpDays",
                table: "ClinicSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "DefaultFollowUpFee",
                table: "ClinicSettings",
                type: "TEXT",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "EnableAppointmentReminders",
                table: "ClinicSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowSameDayAppointments",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "AppointmentDurationMinutes",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "DefaultConsultationFee",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "DefaultFollowUpDays",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "DefaultFollowUpFee",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "EnableAppointmentReminders",
                table: "ClinicSettings");
        }
    }
}
