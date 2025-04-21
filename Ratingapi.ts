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



downloadQuotePDF() {
    if (!this.quoteDetails) {
      this.alertMessage = 'Quote details are not available to download!';
      this.alertType = 'error';
      return;
    }
  
    const doc = new jsPDF();
  
    const fontSize = 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    const imgData = 'logofinal1.png';
    // Function to add watermark & header on each page
    const addPageElements = (doc: jsPDF) => {
      const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i); // Set active page
            // Add watermark at center
            doc.addImage(imgData, 'PNG', 40, 80, 120, 140,);
        }
    };
    // doc.addImage(imgData, 'PNG', 40, 80, 120, 140,); // Directly set opacity (x, y, width, height)
  
    // // Add Company Name next to Logo
    // doc.setFontSize(24);
    // doc.text('BizProtect', 60, 20); // Position text next to the logo
    // Set font color for BizProtect (FFD700 - Gold)
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(24);
    doc.text('BizProtect', 14, 20); // Title at top of the page
    doc.setTextColor(0, 0, 0);
  
    // Add Quote Details Title below the header
    doc.setFontSize(16);
    doc.text('Quote Details', 14, 40);

    addPageElements(doc);
  
    // Start Adding Quote Details
    const details = [
      { label: 'Broker ID', value: this.quoteDetails.brokerId },
      { label: 'Broker Name', value: this.quoteDetails.brokerName },
      { label: 'Business Name', value: this.quoteDetails.businessName },
      { label: 'GST Number', value: this.quoteDetails.gstNo },
      { label: 'Annual Turnover', value: `Rs. ${this.quoteDetails.annualTurnover}` },
      { label: 'Property Value', value: `Rs. ${this.quoteDetails.propertyValue}` },
      { label: 'Location Type', value: this.quoteDetails.locationType },
      { label: 'Contact Person', value: this.quoteDetails.contactPersonName },
      { label: 'Phone Number', value: this.quoteDetails.contactPhoneNumber },
      { label: 'Email', value: this.quoteDetails.email },
      { label: 'Business Address', value: this.quoteDetails.businessAddress },
      { label: 'Year of Operation', value: this.quoteDetails.yearOfOperation },
      { label: 'Number of Employees', value: this.quoteDetails.numberOfEmployees },
      { label: 'Natural Calamity Coverage Needed', value: this.quoteDetails.naturalCalamityCoverageNeeded ? 'Yes' : 'No' },
      { label: 'About Business', value: this.quoteDetails.aboutBusiness },
      { label: 'Plan Type', value: this.quoteDetails.planType },
      { label: 'Quote Amount', value: `Rs. ${this.quoteDetails.quoteAmount}` },
      { label: 'Status', value: this.quoteDetails.status ? 'Submitted' : 'Draft' },
    ];
  
    details.forEach((detail, index) => {
      doc.text(`${detail.label}: ${detail.value}`, 14, 50 + index * 10);
    });
  
    // Add Breakdown Table if factors exist
    if (this.baseRate || this.businessTypeRate || this.locationRate || this.experienceRate || this.employeeRate || this.calamityCoverageRate) {
      const breakdownTable = [
        ['Property Value', `Rs. ${this.propertyRate || 0}`],
        ['Base Rate', `${(this.baseRate || 0) * 100}%`],
        ['Business Type Adjustment', `${(this.businessTypeRate || 0) * 100}%`],
        ['Location Adjustment', `${(this.locationRate || 0) * 100}%`],
        ['Years of Operation Adjustment', `${(this.experienceRate || 0) * 100}%`],
        ['Employee Count Adjustment', `${(this.employeeRate || 0) * 100}%`],
        ['Natural Calamity Coverage Adjustment', `${(this.calamityCoverageRate || 0) * 100}%`],
        ['Total Adjustment', `${(this.finalRate || 0) * 100}%`],
      ];
  
      autoTable(doc, {
        startY: 50 + details.length * 10,
        head: [['Factor', 'Percentage/Adjustment']],
        body: breakdownTable,
        styles: {
          font: 'helvetica',
          fontSize: fontSize,
        },
      });
    }
    
  
    doc.save(`quote-details-${this.quoteDetails.businessName}.pdf`);
  }
