using CapstoneBackend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CapstoneBackend.Helpers
{
    public class JwtHelper
    {
        public static string GenerateToken(UserModel user, IConfiguration configuration)
        {
            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, user.email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("UserId", user.BrokerId.ToString()),
            new Claim("FullName", user.fullName)
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
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
using Microsoft.AspNetCore.Cors;
using CapstoneBackend.Helpers;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.AspNetCore.Authorization;

namespace CapstoneBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("allowCors")]
    public class UserModelsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserModelsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/UserModels
        [HttpGet("list")]
        public async Task<ActionResult<IEnumerable<UserModel>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }
        [AllowAnonymous]
        // GET: api/UserModels/5
        [HttpPost("login")]
        public async Task<ActionResult<UserModel>> GetUserModel([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.email) || string.IsNullOrEmpty(request.password))
            {
                return BadRequest("Email and password are required");
            }

            var userModel = await _context.Users.FirstOrDefaultAsync(u => u.email == request.email && u.password == request.password);

            if (userModel == null)
            {
                return Unauthorized("Invalid EmailId or password");
            }

            var token = JwtHelper.GenerateToken(userModel, _context.GetService<IConfiguration>());

            return Ok(new { token });

        }

        // GET: api/UserModels/quotes/5
        [HttpGet("quotes/{id}")]
        public async Task<ActionResult<UserModel>> GetQuotesByUser(int id)
        {
            var userModel = await _context.Users.Include(u => u.quotes).FirstOrDefaultAsync(u => u.BrokerId == id);

            if (userModel == null)
            {
                return NotFound("User Not Found ");
            }

            return Ok(userModel.quotes.ToList());
        }

        // PUT: api/UserModels/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> PutUserModel(int id, UserModel userModel)
        {
            if (id != userModel.BrokerId)
            {
                return BadRequest("User ID missmatch ");
            }

            _context.Entry(userModel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserModelExists(id))
                {
                    return NotFound("User Not Found");
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Quote Edited successfully " });
        }

        // POST: api/UserModels
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserModel>> PostUserModel(UserModel userModel)
        {
            if (userModel == null)
            {
                return BadRequest("Invalid user Data");
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.email == userModel.email);
            if (existingUser != null)
            {
                return Conflict("A user with this email already exists. ");
            }
            _context.Users.Add(userModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUserModel", new { id = userModel.BrokerId }, userModel);
        }

        // DELETE: api/UserModels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserModel(int id)
        {
            var userModel = await _context.Users.FindAsync(id);
            if (userModel == null)
            {
                return NotFound("User Id Not Found ");
            }

            _context.Users.Remove(userModel);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully " });
        }

        private bool UserModelExists(int id)
        {
            return _context.Users.Any(e => e.BrokerId == id);
        }
    }
}


// import { Injectable } from '@angular/core';
// import { User } from '../../shared/Models/User.Model';
// import { BehaviorSubject } from 'rxjs';
// import * as bcrypt from 'bcryptjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserServiceService {

//   private users: User[] = [];
//   private loggedInUser: User | null = null;
//   private userLoggedInSubject = new BehaviorSubject<User | null>(null);
//   userLoggedIn$ = this.userLoggedInSubject.asObservable();

//   constructor() {
//     const storedUsers = localStorage.getItem('users');
//     if (storedUsers) {
//       this.users = JSON.parse(storedUsers);
//     }
//     const storedLoggedInUser = localStorage.getItem('loggedInUser');
//     if (storedLoggedInUser) {
//       this.loggedInUser = JSON.parse(storedLoggedInUser);
//       this.userLoggedInSubject.next(this.loggedInUser);
//     }
//   }

//   addUser(user: User): void {
//     const salt = bcrypt.genSaltSync(10);
//     user.password = bcrypt.hashSync(user.password, salt);
//     this.users.push(user);
//     localStorage.setItem('users', JSON.stringify(this.users));
//     this.setLoggedInUser(user);
//   }

//   getUser(email: string, password: string): User | undefined {
//     const user = this.users.find(user => user.email === email);
//     if (user && bcrypt.compareSync(password, user.password)) {
//       return user;
//     }
//     return undefined;
//   }

//   setLoggedInUser(user: User): void {
//     this.loggedInUser = user;
//     localStorage.setItem('loggedInUser', JSON.stringify(user));
//     this.userLoggedInSubject.next(user);
//   }

//   getLoggedInUser(): User | null {
//     return this.loggedInUser;
//   }

//   logout(): void {
//     this.loggedInUser = null;
//     localStorage.removeItem('loggedInUser');
//     this.userLoggedInSubject.next(null);
//   }

// }


import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../shared/Models/User.Model';
import * as bcrypt from 'bcryptjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private loggedInUser: User | null = null;
  private userLoggedInSubject = new BehaviorSubject<User | null>(null);
  userLoggedIn$ = this.userLoggedInSubject.asObservable();

  private apiBaseUrl = 'http://localhost:5111/api/UserModels'; 

  constructor(private http: HttpClient) {
    const storedLoggedInUser = localStorage.getItem('loggedInUser');
    if (storedLoggedInUser) {
      this.loggedInUser = JSON.parse(storedLoggedInUser);
      this.userLoggedInSubject.next(this.loggedInUser);
    }
  }

  addUser(user: User): Promise<User> {
    return this.http.post<User>(`${this.apiBaseUrl}/register`, user).toPromise()
      .then((newUser) => {
        if (!newUser) {
          throw new Error('User registration failed or returned invalid data.');
        }
        const salt = bcrypt.genSaltSync(10);
        newUser.password = bcrypt.hashSync(newUser.password || '', salt);
        this.setLoggedInUser(newUser);
        return newUser;
      }).catch((error) => {
        console.error('Registration error:', error);
        throw error;
      });
  }
  

  getUser(email: string, password: string): Promise<User | null> {
    return this.http.post<User>(`${this.apiBaseUrl}/login`, { email, password }).toPromise()
      .then((user) => {
        if (user) {
          this.setLoggedInUser(user);
          return user;
        }
        return null;
      }).catch(() => {
        return null;
      });
  }

  setLoggedInUser(user: User): void {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    this.loggedInUser = user;
    this.userLoggedInSubject.next(user);
  }

  getLoggedInUser(): User | null {
    return this.loggedInUser;
  }

  logout(): void {
    this.loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    this.userLoggedInSubject.next(null);
  }
}
