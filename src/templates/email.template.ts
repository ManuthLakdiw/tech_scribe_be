export const getPasswordResetTemplate = (otp: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #eeeeee;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #4F46E5; 
                text-decoration: none;
            }
            .content {
                padding: 20px 0;
                color: #333333;
                line-height: 1.6;
            }
            .otp-box {
                background-color: #F3F4F6;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                margin: 20px 0;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #1F2937;
                letter-spacing: 5px;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #888888;
                margin-top: 20px;
                border-top: 1px solid #eeeeee;
                padding-top: 10px;
            }
        </style>
    </head>
    <body style="background-color: #f9f9f9; padding: 20px;">
        <div class="container">
            <div class="header">
                <a href="#" class="logo">TechScribe</a>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. Use the code below to proceed:</p>
                
                <div class="otp-box">
                    <span class="otp-code">${otp}</span>
                </div>
                
                <p>This code will expire in <strong>2 minutes</strong>.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} TechScribe. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};