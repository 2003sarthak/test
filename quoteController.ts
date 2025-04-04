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
            return await _context.Quotes.ToListAsync();
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
        public async Task<ActionResult<QuoteModel>> PostQuoteModel(QuoteModel quoteModel)
        {
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
