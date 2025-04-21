using CapstoneBackend.Controllers;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("allowCors")]
    public class RatingController : ControllerBase
    {
        [HttpPost("calculate")]
        public IActionResult CalculateQuote([FromBody] QuoteCalculationDto quote)
        {
            if (quote == null)
            {
                return BadRequest("Invalid quote data.");
            }

            double baseRate = 0.005;
            double businessTypeRate = 0;
            double locationRate = 0;
            double propertyPer = 0.0005;
            double experienceRate = 0;  
            double employeeRate = 0;   
            double calamityCoverageRate = 0;

            // Plan type adjustment
            switch (quote.planType)
            {
                case "Gold":
                    baseRate = 0.01;
                    break;
                case "Premium":
                    baseRate = 0.015;
                    break;
            }

            // Business type adjustment
            switch (quote.businessType)
            {
                case "Retail":
                    businessTypeRate = 0.0001;
                    break;
                case "Manufacturing":
                    businessTypeRate = 0.0003;
                    break;
                case "High Risk":
                    businessTypeRate = 0.0005;
                    break;
            }

            // Property ownership
            if (quote.ownershipType == "Owned")
            {
                propertyPer += 0.00025;
            }
            else if (quote.ownershipType == "Rented")
            {
                propertyPer -= 0.00025;
            }

            double propertyRate = quote.propertyValue * propertyPer;

            // Location adjustment
            switch (quote.locationType)
            {
                case "Urban":
                    locationRate = 0.0001;
                    break;
                case "Semiurban":
                    locationRate = 0.0003;
                    break;
                case "Rural":
                    locationRate = 0.0005;
                    break;
            }
            // Years of Operation Adjustment: More experience means lower risk
            if (quote.yearOfOperation >= 10)
            {
                experienceRate = -0.0005; // Discount for long-running businesses
            }
            else if (quote.yearOfOperation < 3)
            {
                experienceRate = 0.0005; // Higher risk for new businesses
            }

            // Number of Employees Adjustment: More employees, higher responsibility
            if (quote.numberOfEmployees >= 50)
            {
                employeeRate = 0.0003;  // Higher rate for large businesses
            }
            else if (quote.numberOfEmployees >= 10 && quote.numberOfEmployees < 50)
            {
                employeeRate = 0.0002;  // Mid-range adjustment
            }
            else
            {
                employeeRate = 0.0001;  // Smaller businesses have lower impact
            }



            // Natural Calamity Coverage Adjustment: If opted, increase premium
            if (quote.naturalCalamityCoverageNeeded)
            {
                calamityCoverageRate = 0.0015;
            }

            double finalRate = baseRate + businessTypeRate + locationRate + experienceRate + employeeRate + calamityCoverageRate;
            double turnoverComponent = quote.annualTurnover * finalRate;
            double finalQuote = Math.Round(turnoverComponent + propertyRate, 2);

            return Ok(new
            {
                quoteAmount = finalQuote,
                breakdown = new
                {
                    baseRate,
                    businessTypeRate,
                    locationRate,
                    propertyRate,
                    turnoverComponent,
                    finalRate,
                    experienceRate,  
                    employeeRate,   
                    calamityCoverageRate
                }
            });
        }
    }
}



using CapstoneBackend.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace CapstoneBackend.Controllers
{
    public class QuoteCalculationDto
    {

        public double annualTurnover { get; set; }

        public int propertyValue { get; set; }
        public string ownershipType { get; set; }

        public string businessType { get; set; }

        public string locationType { get; set; }

        public string planType { get; set; }

        public int yearOfOperation { get; set; }
        public int numberOfEmployees { get; set; }
        public bool naturalCalamityCoverageNeeded { get; set; }
    }
}

using CapstoneBackend.Controllers;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace CapstoneBackend.NUnitTests
{
    [TestFixture]
    public class RatingControllerTests
    {
        private RatingController _controller;

        [SetUp]
        public void Setup()
        {
            _controller = new RatingController();
        }

        [Test]
        public void CalculateQuote_WithValidInput_ReturnsOkResultWithQuote()
        {
            // Arrange
            var dto = new QuoteCalculationDto
            {
                annualTurnover = 1000000,
                propertyValue = 500000,
                ownershipType = "Owned",
                businessType = "Retail",
                locationType = "Urban",
                planType = "Gold",
                yearOfOperation = 5,
                numberOfEmployees = 20,
                naturalCalamityCoverageNeeded = true
            };

            // Act
            var result = _controller.CalculateQuote(dto) as OkObjectResult;

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(200, result.StatusCode);

            dynamic response = result.Value;
            double quoteAmount = response.quoteAmount;

            Assert.IsTrue(quoteAmount > 0);
            Assert.IsNotNull(response.breakdown);
        }

        [Test]
        public void CalculateQuote_WithNullInput_ReturnsBadRequest()
        {
            // Act
            var result = _controller.CalculateQuote(null);

            // Assert
            Assert.IsInstanceOf<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;

            Assert.AreEqual(400, badRequestResult.StatusCode);
            Assert.AreEqual("Invalid quote data.", badRequestResult.Value);
        }
    }
}

