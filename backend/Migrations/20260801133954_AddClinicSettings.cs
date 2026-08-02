using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddClinicSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClinicSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ClinicName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ClinicPhone = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    ClinicEmail = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    PinCode = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    DoctorName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Qualification = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    RegistrationNumber = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Specialisation = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true),
                    DoctorPhone = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    DoctorEmail = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClinicSettings");
        }
    }
}
