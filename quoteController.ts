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
        public UserModel borker { get; set; }
        public string brokerName { get; set; }

    }
}


using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CapstoneBackend.Models
{
    public class UserModel
    {
        [Key,DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BrokerId { get; set; }
        [Required]
        public string fullName { get; set; }
        [Required,EmailAddress]
        public string email { get; set; }
        [Required]
        public string password { get; set; }

        public ICollection<QuoteModel> quotes { get; set; }=new List<QuoteModel>();

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

namespace CapstoneBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
            return await _context.Quotes.Include(q=>q.borker).ToListAsync();
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
            var borker =await _context.Users.FirstOrDefaultAsync(u=>u.email == userEmail);
            if(borker == null)
            {
                return Unauthorized("Invalid user");
            }
            quoteModel.brokerId = borker.BrokerId;
            quoteModel.brokerName = borker.fullName;
            _context.Quotes.Add(quoteModel);
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


      VALUES (@p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14, @p15, @p16, @p17, @p18, @p19);
fail: Microsoft.AspNetCore.Diagnostics.DeveloperExceptionPageMiddleware[1]
      An unhandled exception has occurred while executing the request.
      System.Text.Json.JsonException: A possible object cycle was detected. This can either be due to a cycle or if the object depth is larger than the maximum allowed depth of 32. Consider using ReferenceHandler.Preserve on JsonSerializerOptions to support cycles. Path: $.borker.quotes.borker.quotes.borker.quotes.borker.quotes.borker.quotes.borker.quotes.borker.quotes.borker.quotes.borker.quotes.borker.quotes.borker.BrokerId.
         at System.Text.Json.ThrowHelper.ThrowJsonException_SerializerCycleDetected(Int32 maxDepth)
         at System.Text.Json.Serialization.JsonConverter`1.TryWrite(Utf8JsonWriter writer, T& value, JsonSerializerOptions options, WriteStack& state)
         at System.Text.Json.Serialization.Metadata.JsonPropertyInfo`1.GetMemberAndWriteJson(Object obj, WriteStack& state, Utf8JsonWriter writer)
         at System.Text.Json.Serialization.Converters.ObjectDefaultConverter`1.OnTryWrite(Utf8JsonWriter writer, T value, JsonSerializerOptions options, WriteStack& state)
         at System.Text.Json.Serialization.JsonConverter`1.TryWrite(Utf8JsonWriter writer, T& value, JsonSerializerOptions options, WriteStack& state)
         at System.Text.Json.Serialization.Metadata.JsonPropertyInfo`1.GetMemberAndWriteJson(Object obj, WriteStack& state, Utf8JsonWriter writer)
