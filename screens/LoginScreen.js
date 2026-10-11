// FIGHTING ARENA — LOGIN SCREEN (Firebase Auth + EmailJS Verification)
// Register flow: fill form → receive 6-digit code via email → enter code → create account
// ═══════════════════════════════════════════════════════════════

const LoginScreen = (() => {

  let _currentUser     = null;
  let _loggingOut      = false;
  let _authUnsubscribe = null;

  // Pending registration data (held until code is verified)
  let _pendingReg = null;  // { username, email, password, code, expiresAt }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  function getLoggedInUser() {
    if (_currentUser) {
      return _currentUser.displayName
        || _currentUser.email?.split('@')[0]
        || 'PLAYER';
    }
    return 'GUEST';
  }

  function isGuest() { return !_currentUser; }

  function logout() {
    const FA = window.FirebaseAuth;
    _loggingOut  = true;
    _currentUser = null;
    _pendingReg  = null;
    if (_authUnsubscribe) { _authUnsubscribe(); _authUnsubscribe = null; }
    if (FA) FA.signOut(FA.auth);
  }

  // ─────────────────────────────────────────────
  // ENTER / EXIT
  // ─────────────────────────────────────────────
  function enter() {
    const FA = window.FirebaseAuth;
    if (!FA) { setTimeout(() => enter(), 300); return; }

    _loggingOut = false;
    _pendingReg = null;

    if (_authUnsubscribe) { _authUnsubscribe(); _authUnsubscribe = null; }

    _authUnsubscribe = FA.onAuthStateChanged(FA.auth, (user) => {
      if (user && !_loggingOut) {
        _currentUser = user;
        if (_authUnsubscribe) { _authUnsubscribe(); _authUnsubscribe = null; }
        GameManager.navigate('MENU');
      }
    });

    _showTab('login');
    _wireButtons();
    _showMsg('', '');
  }

  function exit() {
    if (_authUnsubscribe) { _authUnsubscribe(); _authUnsubscribe = null; }
  }

  // ─────────────────────────────────────────────
  // TAB SWITCHING
  // ─────────────────────────────────────────────
  function _showTab(tab) {
    const loginForm  = document.getElementById('formLogin');
    const regForm    = document.getElementById('formRegister');
    const verifyPanel = document.getElementById('verifyPanel');
    const tabLogin   = document.getElementById('tabLogin');
    const tabReg     = document.getElementById('tabRegister');

    // Hide all forms first
    loginForm?.classList.add('hidden');
    regForm?.classList.add('hidden');
    verifyPanel?.classList.add('hidden');

    if (tab === 'login') {
      loginForm?.classList.remove('hidden');
      tabLogin?.classList.add('active');
      tabReg?.classList.remove('active');
    } else if (tab === 'register') {
      regForm?.classList.remove('hidden');
      tabLogin?.classList.remove('active');
      tabReg?.classList.add('active');
    } else if (tab === 'verify') {
      verifyPanel?.classList.remove('hidden');
      tabLogin?.classList.remove('active');
      tabReg?.classList.add('active');
    }

    _showMsg('', '');
  }

  // ─────────────────────────────────────────────
  // MESSAGE DISPLAY
  // ─────────────────────────────────────────────
  function _showMsg(text, type) {
    const el = document.getElementById('loginMsg');
    if (!el) return;
    if (!text) { el.className = 'login-msg hidden'; return; }
    el.textContent = text;
    el.className   = `login-msg ${type}`;
  }

  function _setLoading(loading) {
    const loginBtn = document.querySelector('#formLogin .login-btn-submit');
    const regBtn   = document.querySelector('#formRegister .login-btn-submit');
    if (loginBtn) loginBtn.textContent = loading ? 'LOADING...' : 'ENTER THE ARENA';
    if (regBtn)   regBtn.textContent   = loading ? 'LOADING...' : 'CREATE ACCOUNT';
  }

  // ─────────────────────────────────────────────
  // WIRE BUTTONS
  // ─────────────────────────────────────────────
  function _wireButtons() {
    const ids = ['tabLogin','tabRegister','btnGuest','formLogin','formRegister',
                 'btnVerifyCode','btnResendCode'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
    });

    document.getElementById('tabLogin')
      ?.addEventListener('click', () => { _pendingReg = null; _showTab('login'); });
    document.getElementById('tabRegister')
      ?.addEventListener('click', () => { _pendingReg = null; _showTab('register'); });
    document.getElementById('formLogin')
      ?.addEventListener('submit', e => { e.preventDefault(); _handleLogin(); });
    document.getElementById('formRegister')
      ?.addEventListener('submit', e => { e.preventDefault(); _handleRegister(); });
    document.getElementById('btnGuest')
      ?.addEventListener('click', () => _handleGuest());
    document.getElementById('btnVerifyCode')
      ?.addEventListener('click', () => _handleVerify());
    document.getElementById('btnResendCode')
      ?.addEventListener('click', () => _resendCode());

    // Allow pressing Enter in the code input
    document.getElementById('verifyCodeInput')
      ?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); _handleVerify(); }
      });
  }

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  async function _handleLogin() {
    const FA       = window.FirebaseAuth;
    const email    = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
      _showMsg('Please fill in all fields.', 'error'); return;
    }

    _setLoading(true);
    try {
      const result = await FA.signInWithEmailAndPassword(FA.auth, email, password);
      _currentUser = result.user;
      _showMsg(`Welcome back, ${getLoggedInUser()}!`, 'success');
      setTimeout(() => GameManager.navigate('MENU'), 800);
    } catch (err) {
      _setLoading(false);
      _showMsg(_firebaseError(err.code), 'error');
    }
  }

  // ─────────────────────────────────────────────
  // REGISTER — Step 1: validate form, send code
  // ─────────────────────────────────────────────
  async function _handleRegister() {
    const username = document.getElementById('regUsername')?.value.trim();
    const email    = document.getElementById('regEmail')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const confirm  = document.getElementById('regConfirm')?.value;

    if (!username || !email || !password || !confirm) {
      _showMsg('Please fill in all fields.', 'error'); return;
    }
    if (username.length < 3) {
      _showMsg('Username must be at least 3 characters.', 'error'); return;
    }
    if (password.length < 6) {
      _showMsg('Password must be at least 6 characters.', 'error'); return;
    }
    if (password !== confirm) {
      _showMsg('Passwords do not match.', 'error'); return;
    }

    // Generate a 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Store pending registration (code expires in 10 minutes)
    _pendingReg = {
      username,
      email,
      password,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    // Disable button while sending
    const regBtn = document.querySelector('#formRegister .login-btn-submit');
    if (regBtn) { regBtn.textContent = 'SENDING CODE...'; regBtn.disabled = true; }

    const sent = await _sendVerificationCode(username, email, code);

    if (regBtn) { regBtn.textContent = 'CREATE ACCOUNT'; regBtn.disabled = false; }

    if (!sent) {
      _pendingReg = null;
      _showMsg('Failed to send verification email. Check your email address and try again.', 'error');
      return;
    }

    // Show verification panel
    const infoEl = document.getElementById('verifyInfo');
    if (infoEl) {
      infoEl.textContent = `A 6-digit code was sent to ${email}. Enter it below to complete your registration.`;
    }
    const codeInput = document.getElementById('verifyCodeInput');
    if (codeInput) codeInput.value = '';

    _showTab('verify');
    _showMsg('Check your email for the verification code!', 'success');
    setTimeout(() => codeInput?.focus(), 200);
  }

  // ─────────────────────────────────────────────
  // REGISTER — Step 2: verify code → create account
  // ─────────────────────────────────────────────
  async function _handleVerify() {
    if (!_pendingReg) {
      _showMsg('Session expired. Please register again.', 'error');
      _showTab('register'); return;
    }

    // Check expiry
    if (Date.now() > _pendingReg.expiresAt) {
      _showMsg('Code has expired. Please request a new one.', 'error');
      _pendingReg = null;
      _showTab('register'); return;
    }

    const entered = document.getElementById('verifyCodeInput')?.value.trim();
    if (!entered) {
      _showMsg('Please enter the verification code.', 'error'); return;
    }

    if (entered !== _pendingReg.code) {
      _showMsg('Incorrect code. Please try again.', 'error'); return;
    }

    // Code correct — create Firebase account
    const FA       = window.FirebaseAuth;
    const verifyBtn = document.getElementById('btnVerifyCode');
    if (verifyBtn) { verifyBtn.textContent = 'CREATING ACCOUNT...'; verifyBtn.disabled = true; }

    try {
      const result = await FA.createUserWithEmailAndPassword(
        FA.auth, _pendingReg.email, _pendingReg.password
      );
      _currentUser = result.user;

      const { updateProfile } = await import(
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
      );
      await updateProfile(_currentUser, { displayName: _pendingReg.username });

      _showMsg(`Account created! Welcome, ${_pendingReg.username}!`, 'success');
      _pendingReg = null;

      setTimeout(() => GameManager.navigate('MENU'), 900);
    } catch (err) {
      if (verifyBtn) { verifyBtn.textContent = 'VERIFY & CREATE ACCOUNT'; verifyBtn.disabled = false; }
      _showMsg(_firebaseError(err.code), 'error');
    }
  }

  // ─────────────────────────────────────────────
  // RESEND CODE
  // ─────────────────────────────────────────────
  async function _resendCode() {
    if (!_pendingReg) {
      _showMsg('Session expired. Please register again.', 'error');
      _showTab('register'); return;
    }

    // Generate a fresh code and reset expiry
    const code = String(Math.floor(100000 + Math.random() * 900000));
    _pendingReg.code      = code;
    _pendingReg.expiresAt = Date.now() + 10 * 60 * 1000;

    const resendBtn = document.getElementById('btnResendCode');
    if (resendBtn) { resendBtn.textContent = 'SENDING...'; resendBtn.disabled = true; }

    const sent = await _sendVerificationCode(_pendingReg.username, _pendingReg.email, code);

    if (resendBtn) { resendBtn.textContent = 'Resend Code'; resendBtn.disabled = false; }

    _showMsg(
      sent ? 'New code sent! Check your email.' : 'Failed to resend. Try again.',
      sent ? 'success' : 'error'
    );
  }

  // ─────────────────────────────────────────────
  // EMAILJS — SEND VERIFICATION CODE
  // ─────────────────────────────────────────────
  function _sendVerificationCode(username, email, code) {
    return new Promise((resolve) => {
      if (typeof emailjs === 'undefined') {
        console.warn('[EmailJS] SDK not loaded.');
        resolve(false); return;
      }

      const templateParams = {
        to_name:  username,
        to_email: email,
        code:     code,        // {{code}} in your EmailJS template
        game_name: 'Fighting Arena',
      };

      emailjs.send('service_4xrdqe5', 'template_8elix8h', templateParams)
        .then(() => {
          console.log('[EmailJS] Verification code sent to', email);
          resolve(true);
        })
        .catch((err) => {
          console.warn('[EmailJS] Send failed:', err);
          resolve(false);
        });
    });
  }

  // ─────────────────────────────────────────────
  // GUEST
  // ─────────────────────────────────────────────
  function _handleGuest() {
    _currentUser = null;
    GameManager.navigate('MENU');
  }

  // ─────────────────────────────────────────────
  // FIREBASE ERROR MESSAGES
  // ─────────────────────────────────────────────
  function _firebaseError(code) {
    const map = {
      'auth/user-not-found':         'Account not found. Please register first.',
      'auth/wrong-password':         'Incorrect password. Try again.',
      'auth/email-already-in-use':   'Email already registered. Please login.',
      'auth/invalid-email':          'Invalid email address.',
      'auth/weak-password':          'Password must be at least 6 characters.',
      'auth/too-many-requests':      'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/invalid-credential':     'Invalid email or password.',
    };
    return map[code] || `Error: ${code}`;
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    enter,
    exit,
    getLoggedInUser,
    isGuest,
    logout,
  };

})();
