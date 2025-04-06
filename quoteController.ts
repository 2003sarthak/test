import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { AlertComponent } from '../../shared/Components/alert/alert.component';
import { UserServiceService } from '../../Services/User.Service/user-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quote',
  imports: [NgIf,AlertComponent,FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.css',
  standalone:true,
})
export class QuoteComponent {
  constructor(private userService: UserServiceService, private router: Router) { }
  step = 1;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;
  submittedQuote: any = null;
  submittedQuotes: any[] = JSON.parse(localStorage.getItem('submittedQuotes') || '[]');
  loggedInUser: any = null;

  ngOnInit(): void {
    const user = this.userService.getLoggedInUser();
    if (!this.userService.getLoggedInUser()) {
      this.router.navigate(['/login']);
    }else {
      this.loggedInUser = user; 
    }

  }

  // Define the form group with all controls
  quoteForm = new FormGroup({
    businessName: new FormControl('', Validators.required),
    GSTNo:new FormControl('',[Validators.minLength(15),Validators.maxLength(15)]),
    annualTurnover: new FormControl('', [Validators.required, Validators.min(10000)]),
    businessType: new FormControl('Retail', Validators.required),
    propertyValue: new FormControl('', Validators.required),
    ownershipType: new FormControl('Owned', Validators.required),
    locationType: new FormControl('Urban', Validators.required),
    securitySystem: new FormControl(''),
    previousClaims: new FormControl(''),
    planType: new FormControl('Normal', Validators.required),
  });

  // Variables for displaying breakdown in the summary
  baseRate = 0.005;
  businessTypeRate = 0;
  propertyRate = 0;
  propertyPer = 0;
  locationRate = 0;
  finalRate = 0;
  finalValue = 0;

  // Step Navigation Methods
  nextStep() {
    if (this.step === 1 && this.quoteForm.controls['businessName'].valid && this.quoteForm.controls['annualTurnover'].valid) {
      this.step++;
    } else if (this.step === 2 && this.quoteForm.controls['propertyValue'].valid) {
      this.step++;
    } else {
      this.alertMessage = 'Please fill in all required fields!';
      this.alertType = 'error';
    }
  }

  prevStep() {
    this.step--;
  }

  // Quote Calculation
  calculateQuote() {
    this.baseRate = 0.005; // 0.1%

    // Plan type adjustment
    switch (this.quoteForm.value.planType) {
      case 'Gold':
        this.baseRate = 0.01;
        break;
      case 'Premium':
        this.baseRate = 0.015;
        break;
    }

    // Business type adjustment
    switch (this.quoteForm.value.businessType) {
      case 'Retail':
        this.businessTypeRate = 0.0025;
        break;
      case 'Manufacturing':
        this.businessTypeRate = 0.005;
        break;
      case 'High Risk':
        this.businessTypeRate = 0.0075;
        break;
    }

    // Property value adjustment
    this.propertyPer= 0.0005; 
    if (this.quoteForm.value.ownershipType === 'Owned') {
      this.propertyPer += 0.00025; 
    } else if (this.quoteForm.value.ownershipType === 'Rented') {
      this.propertyPer -= 0.00025;
    }
    this.propertyRate = Number(this.quoteForm.value.propertyValue)*this.propertyPer ;

    // Location type adjustment
    switch (this.quoteForm.value.locationType) {
      case 'Urban':
        this.locationRate = 0.0025;
        break;
      case 'Semiurban':
        this.locationRate = 0.005;
        break;
      case 'Rural':
        this.locationRate = 0.0075;
        break;
    }

    // Calculate final rate
    this.finalRate =
      this.baseRate + this.businessTypeRate + this.locationRate;
    
    this.finalValue=Math.round(Number(this.quoteForm.value.annualTurnover) * this.finalRate);

    // Calculate the quote
    return this.finalValue + this.propertyRate;
  }

  submitQuote() {
    if (this.quoteForm.valid) {
      const currentDate = new Date(); 
      const id = `Q-2025-${this.submittedQuotes.length + 1}`;
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const brokerIndex = users.findIndex((user: any) => user.fullName === this.loggedInUser.fullName);
      const brokerId = `Bro00${brokerIndex}`;
      const brokerName = this.loggedInUser.fullName;
      
      this.submittedQuote = {
        ...this.quoteForm.value,
        quoteAmount: this.calculateQuote(),
        status: false, 
        createdAt: currentDate.toISOString(), 
        id: id,
        brokerName: brokerName,
        brokerId: brokerId,
      };
      const newQuote = {
        ...this.quoteForm.value,
        quoteAmount: this.calculateQuote(),
        status: false, 
        createdAt: currentDate.toISOString(),
        id: id,
        brokerName: brokerName,
        brokerId: brokerId,
      };
      this.submittedQuotes.push(newQuote);
      localStorage.setItem('submittedQuotes', JSON.stringify(this.submittedQuotes));
      this.alertMessage = 'Quote submitted successfully!';
      this.alertType = 'success';
      //reset the form 
      this.quoteForm.reset();
      this.step = 1; 
    } else {
      this.alertMessage = 'Please complete all required fields!';
      this.alertType = 'error';
    }
  }

}



using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CapstoneBackend.Models
{
    public class QuoteModel
    {
        [Key,DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }
        [Required]
        public string businessName { get; set; }
        public string GSTNo { get; set; }
        [Required]
        public double annualTurnover { get; set; }
        [Required]
        public int propertyValue { get; set; }
        public string ownershipType { get; set; }
        [Required]
        public string businessType { get; set; }
        [Required]
        public string locationType { get; set; }

        public string securitySystem { get; set; }
        public string previousClaims { get; set; }

        public bool securityMeasures { get; set; }
        [Required]
        public string planType { get; set; }
        public double quoteAmount { get; set; }
        public bool status { get; set; }
        public DateTime created { get; set; }=DateTime.UtcNow;
        [Required]
        public int brokerId { get; set; }
        [ForeignKey("brokerId")]
        public UserModel? broker { get; set; }
        public string brokerName { get; set; }

    }
}


using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CapstoneBackend.Models;
using Microsoft.AspNetCore.Cors;

namespace CapstoneBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("allowCors")]
    public class QuoteModelsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuoteModelsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/QuoteModels
        [HttpGet("list")]
        public async Task<ActionResult<IEnumerable<QuoteModel>>> GetQuotes()
        {
            return await _context.Quotes.Include(q=>q.broker).ToListAsync();
        }

        // GET: api/QuoteModels/5
        [HttpGet("get/{id}")]
        public async Task<ActionResult<QuoteModel>> GetQuoteModel(int id)
        {
            var quoteModel = await _context.Quotes.FindAsync(id);

            if (quoteModel == null)
            {
                return NotFound("Quote Not Found");
            }

            return quoteModel;
        }


        // PUT: api/QuoteModels/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> PutQuoteModel(int id, QuoteModel quoteModel)
        {
            if (id != quoteModel.id)
            {
                return BadRequest("Quote ID Missmatch");
            }

            _context.Entry(quoteModel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuoteModelExists(id))
                {
                    return NotFound("Quote Not Found");
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Quote Edited successfully " });
        }

        // POST: api/QuoteModels
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("create")]
        public async Task<ActionResult<QuoteModel>> PostQuoteModel([FromBody] QuoteModel quoteModel, [FromHeader] string userEmail)
        {
            if(quoteModel == null)
            {
                return BadRequest("Invalid data");
            }
            var broker =await _context.Users.Include(u=>u.quotes).FirstOrDefaultAsync(u => u.email == userEmail);
            if (broker == null)
            {
                return Unauthorized("Invalid user");
            }
            quoteModel.broker = null;
            quoteModel.brokerId = broker.BrokerId;
            quoteModel.brokerName = broker.fullName;
            broker.quotes.Add(quoteModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetQuoteModel", new { id = quoteModel.id }, quoteModel);
        }

        // DELETE: api/QuoteModels/5
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteQuoteModel(int id)
        {
            var quoteModel = await _context.Quotes.FindAsync(id);
            if (quoteModel == null)
            {
                return NotFound("Quote Not Found");
            }

            _context.Quotes.Remove(quoteModel);
            await _context.SaveChangesAsync();

            return Ok(new {message="Quote Deleted successfully "});
        }



        private bool QuoteModelExists(int id)
        {
            return _context.Quotes.Any(e => e.id == id);
        }
    }
}

