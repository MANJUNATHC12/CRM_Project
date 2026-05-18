using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Crm.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailAndPhoneToLead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Leads",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Leads",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Leads");
        }
    }
}
