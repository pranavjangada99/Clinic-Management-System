using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowPartialPayments",
                table: "ClinicSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "ClinicSettings",
                type: "TEXT",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InvoiceFooter",
                table: "ClinicSettings",
                type: "TEXT",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "PrintReceiptAfterPayment",
                table: "ClinicSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptFooter",
                table: "ClinicSettings",
                type: "TEXT",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "ShowOutstandingBalance",
                table: "ClinicSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowPartialPayments",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "InvoiceFooter",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "PrintReceiptAfterPayment",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "ReceiptFooter",
                table: "ClinicSettings");

            migrationBuilder.DropColumn(
                name: "ShowOutstandingBalance",
                table: "ClinicSettings");
        }
    }
}
