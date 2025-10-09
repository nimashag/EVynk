using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Options;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: EmailService.cs
//  Created: 2025-01-27
//  Description: Handles email sending functionality for user credentials.
//  Author: Assistant
// ==============================================

namespace EVynk.Booking.Api.Services
{
    public class EmailSettings
    {
        public const string SectionName = "EmailSettings";
        public string SmtpServer { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string SmtpUsername { get; set; } = string.Empty;
        public string SmtpPassword { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
    }

    public interface IEmailService
    {
        Task SendOperatorCredentialsAsync(string toEmail, string email, string password);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> emailOptions, ILogger<EmailService> logger)
        {
            _emailSettings = emailOptions.Value;
            _logger = logger;
        }

        public async Task SendOperatorCredentialsAsync(string toEmail, string email, string password)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromEmail));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = "Welcome to EVynk - Your Station Operator Account";

                var bodyBuilder = new BodyBuilder();
                bodyBuilder.HtmlBody = $@"
                    <!DOCTYPE html>
                    <html lang='en'>
                    <head>
                        <meta charset='UTF-8'>
                        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                        <title>Welcome to EVynk</title>
                        <style>
                            body {{
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.6;
                                color: #374151;
                                background-color: #f3f4f6;
                                margin: 0;
                                padding: 20px;
                            }}
                            .email-wrapper {{
                                max-width: 600px;
                                margin: 0 auto;
                            }}
                            .email-card {{
                                background-color: #ffffff;
                                border-radius: 16px;
                                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                                overflow: hidden;
                                border: 1px solid #e5e7eb;
                            }}
                            .header {{
                                background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
                                color: white;
                                padding: 40px 30px;
                                text-align: center;
                            }}
                            .header h1 {{
                                margin: 0;
                                font-size: 32px;
                                font-weight: 700;
                                letter-spacing: -0.5px;
                            }}
                            .header .subtitle {{
                                margin: 8px 0 0 0;
                                font-size: 16px;
                                opacity: 0.9;
                                font-weight: 400;
                            }}
                            .content {{
                                padding: 40px 30px;
                            }}
                            .welcome-section {{
                                margin-bottom: 32px;
                            }}
                            .welcome-section h2 {{
                                color: #1f2937;
                                font-size: 24px;
                                margin: 0 0 16px 0;
                                font-weight: 600;
                            }}
                            .welcome-section p {{
                                color: #6b7280;
                                font-size: 16px;
                                margin: 0 0 16px 0;
                            }}
                            .credentials-section {{
                                margin: 32px 0;
                                padding: 24px;
                                background-color: #f9fafb;
                                border-radius: 12px;
                                border: 1px solid #e5e7eb;
                            }}
                            .credentials-title {{
                                color: #1f2937;
                                font-size: 18px;
                                font-weight: 600;
                                margin: 0 0 20px 0;
                                display: flex;
                                align-items: center;
                            }}
                            .key-icon {{
                                margin-right: 8px;
                                font-size: 20px;
                            }}
                            .credential-item {{
                                margin: 16px 0;
                                display: flex;
                                align-items: center;
                            }}
                            .credential-label {{
                                font-weight: 500;
                                color: #374151;
                                min-width: 70px;
                                margin-right: 12px;
                                font-size: 14px;
                            }}
                            .credential-value {{
                                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                                color: #2c5aa0;
                                font-weight: 500;
                                font-size: 14px;
                                background-color: #ffffff;
                                padding: 6px 10px;
                                border-radius: 6px;
                                border: 1px solid #d1d5db;
                            }}
                            .security-section {{
                                margin: 32px 0;
                                padding: 20px;
                                background-color: #fef3c7;
                                border-radius: 12px;
                                border-left: 4px solid #f59e0b;
                            }}
                            .security-title {{
                                color: #92400e;
                                font-size: 16px;
                                font-weight: 600;
                                margin: 0 0 12px 0;
                            }}
                            .security-list {{
                                margin: 0;
                                padding-left: 20px;
                            }}
                            .security-list li {{
                                margin: 8px 0;
                                color: #92400e;
                                font-size: 14px;
                            }}
                            .cta-section {{
                                text-align: center;
                                margin: 32px 0;
                            }}
                            .cta-text {{
                                color: #374151;
                                font-size: 16px;
                                margin: 0 0 20px 0;
                            }}
                            .cta-button {{
                                display: inline-block;
                                background: linear-gradient(135deg,rgb(190, 192, 195));
                                color: white;
                                padding: 12px 24px;
                                text-decoration: none;
                                border-radius: 8px;
                                font-weight: 600;
                                font-size: 16px;
                                box-shadow: 0 4px 6px rgba(44, 90, 160, 0.2);
                            }}
                            .divider {{
                                height: 1px;
                                background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
                                margin: 32px 0;
                            }}
                            .features-section {{
                                margin: 32px 0;
                            }}
                            .features-title {{
                                color: #1f2937;
                                font-size: 18px;
                                font-weight: 600;
                                margin: 0 0 16px 0;
                            }}
                            .features-list {{
                                margin: 0;
                                padding-left: 20px;
                            }}
                            .features-list li {{
                                margin: 8px 0;
                                color: #6b7280;
                                font-size: 14px;
                            }}
                            .help-section {{
                                margin: 32px 0;
                                padding: 20px;
                                background-color: #eff6ff;
                                border-radius: 12px;
                                border-left: 4px solid #3b82f6;
                            }}
                            .help-text {{
                                margin: 0;
                                color: #1e40af;
                                font-size: 14px;
                            }}
                            .footer {{
                                background-color: #f9fafb;
                                padding: 24px 30px;
                                text-align: center;
                                border-top: 1px solid #e5e7eb;
                            }}
                            .footer p {{
                                margin: 4px 0;
                                font-size: 12px;
                                color: #9ca3af;
                            }}
                            .footer .company-name {{
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            }}
                            @media (max-width: 600px) {{
                                body {{
                                    padding: 10px;
                                }}
                                .content {{
                                    padding: 24px 20px;
                                }}
                                .header {{
                                    padding: 30px 20px;
                                }}
                                .credential-item {{
                                    flex-direction: column;
                                    align-items: flex-start;
                                }}
                                .credential-label {{
                                    margin-bottom: 4px;
                                }}
                            }}
                        </style>
                    </head>
                    <body>
                        <div class='email-wrapper'>
                            <div class='email-card'>
                                <div class='header'>
                                    <h1>EVynk</h1>
                                    <p class='subtitle'>Electric Vehicle Charging Network</p>
                                </div>
                                
                                <div class='content'>
                                    <div class='welcome-section'>
                                        <h2>Welcome to EVynk!</h2>
                                        <p>Dear Station Operator,</p>
                                        <p>Your account has been successfully created by our Back Office team. You can now access the operator dashboard to manage charging stations and bookings.</p>
                                    </div>
                                    
                                    <div class='credentials-section'>
                                        <div class='credentials-title'>
                                            <span class='key-icon'>🔑</span>
                                            Login Credentials
                                        </div>
                                        <div class='credential-item'>
                                            <span class='credential-label'>Email:</span>
                                            <span class='credential-value'>{email}</span>
                                        </div>
                                        <div class='credential-item'>
                                            <span class='credential-label'>Password:</span>
                                            <span class='credential-value'>{password}</span>
                                        </div>
                                    </div>
                                    
                                    <div class='security-section'>
                                        <div class='security-title'>Important Security Notes</div>
                                        <ul class='security-list'>
                                            <li>Please change your password after your first login</li>
                                            <li>Keep your credentials secure and do not share them</li>
                                            <li>Contact support if you have any issues accessing your account</li>
                                        </ul>
                                    </div>
                                    
                                    <div class='cta-section'>
                                        <p class='cta-text'>You can now log in to the EVynk system using these credentials.</p>
                                        <a href='#' class='cta-button'>Access Dashboard</a>
                                    </div>
                                    
                                    <div class='divider'></div>
                                    
                                    <div class='features-section'>
                                        <div class='features-title'>What you can do:</div>
                                        <ul class='features-list'>
                                            <li>Monitor charging station status and availability</li>
                                            <li>Manage bookings and reservations</li>
                                            <li>View real-time charging session data</li>
                                            <li>Generate reports on station performance</li>
                                        </ul>
                                    </div>
                                    
                                    <div class='help-section'>
                                        <p class='help-text'><strong>Need Help?</strong> Our support team is here to assist you with any questions or technical assistance.</p>
                                    </div>
                                </div>
                                
                                <div class='footer'>
                                    <p class='company-name'>EVynk Booking System</p>
                                    <p>This is an automated message. Please do not reply to this email.</p>
                                    <p>© 2025 EVynk. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>";

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
            }
        }
    }
}
