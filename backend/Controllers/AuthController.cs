using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Crm.Api.Models;
using System.Security.Claims;
using Crm.Api.DTOs;

using Microsoft.AspNetCore.Authorization;

namespace Crm.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    // Register a new user
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FullName = model.FullName
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Assign default role (e.g., Sales)
            await _userManager.AddToRoleAsync(user, "Sales");

            var token = await GenerateJwtToken(user);
            return Ok(new { token });
        }

        // Login existing user
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Unauthorized();

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);
            if (!result.Succeeded)
                return Unauthorized();

            var token = await GenerateJwtToken(user);
            return Ok(new { token });
        }

        // Existing Register, Login, ForgotPassword methods unchanged ...

    [HttpGet("external-login/{provider}")]
    public IActionResult ExternalLogin(string provider, [FromQuery] string returnUrl = "/")
    {
        var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Auth", new { returnUrl });
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
        return Challenge(properties, provider);
    }

    [HttpGet("external-login-callback")]
    public async Task<IActionResult> ExternalLoginCallback([FromQuery] string returnUrl = "/")
    {
        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            // Redirect back with error
            return Redirect($"{returnUrl}?error=ExternalLoginFailed");
        }

        // Try to sign in the user with the external login info
        var signInResult = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false, bypassTwoFactor: true);
        ApplicationUser user;
        if (signInResult.Succeeded)
        {
            // User already exists, fetch user
            user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
        }
        else
        {
            // User does not exist, create a new one
            var email = info.Principal.FindFirstValue(System.Security.Claims.ClaimTypes.Email);
            var name = info.Principal.FindFirstValue(System.Security.Claims.ClaimTypes.Name) ?? email;
            user = new ApplicationUser { UserName = email, Email = email, FullName = name };
            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return Redirect($"{returnUrl}?error=UserCreationFailed");
            }
            // Add login info
            await _userManager.AddLoginAsync(user, info);
        }

        // Generate JWT token for the user
        var token = await GenerateJwtToken(user);
        // Redirect to front‑end with token as query param
        return Redirect($"{returnUrl}?token={token}");
    }

    // Existing GenerateJwtToken method unchanged
    private async Task<string> GenerateJwtToken(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtConfig");
        var key = System.Text.Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);
        var roles = await _userManager.GetRolesAsync(user);
        var claims = new List<System.Security.Claims.Claim>
        {
            new System.Security.Claims.Claim("Id", user.Id),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, user.FullName),
            new System.Security.Claims.Claim(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email, user.Email!),
            new System.Security.Claims.Claim(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub, user.Email!),
            new System.Security.Claims.Claim(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        foreach (var role in roles)
            claims.Add(new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, role));
        var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key), Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
        };
        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var tokenObj = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(tokenObj);
    }
}
