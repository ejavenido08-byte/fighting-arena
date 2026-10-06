// FIGHTING ARENA — LOGIN SCREEN (Firebase Auth)
// Uses Firebase Email/Password Authentication.
// ═══════════════════════════════════════════════════════════════

const LoginScreen = (() => {

  let _currentUser = null;  // Firebase user object

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  function getLoggedInUser() {
    if (_currentUser) {
      // Use displayName if set, otherwise use email prefix
      return _currentUser.displayName
        || _currentUser.email?.split('@')[0]
        || 'PLAYER';
    }
    return 'GUEST';
  }

  function isGuest() {
    return !_currentUser;
  }

  function logout() {
    const FA = window.FirebaseAuth;
    if (FA) FA.signOut(FA.auth);
    _currentUser = null;
  }

  // ─────────────────────────────────────────────
  // ENTER / EXIT
  // ─────────────────────────────────────────────
  function enter() {
    const FA = window.FirebaseAuth;

    if (!FA) {
      // Firebase not loaded yet — wait and retry
      setTimeout(() => enter(), 300);
      return;
    }

    // Listen for auth state — if already logged in skip login
    FA.onAuthStateChanged(FA.auth, (user) => {
      if (user) {
        _currentUser = user;
        GameManager.navigate('MENU');
      }
    });

    _showTab('login');
    _wireButtons();
    _showMsg('', '');
  }

  function exit() {}

  // ─────────────────────────────────────────────
  // TAB SWITCHING
  // ─────────────────────────────────────────────
  function _showTab(tab) {
    const loginForm    = document.getElementById('formLogin');
    const registerForm = document.getElementById('formRegister');
    const tabLogin     = document.getElementById('tabLogin');
    const tabRegister  = document.getElementById('tabRegister');

    if (tab === 'login') {
      loginForm?.classList.remove('hidden');
      registerForm?.classList.add('hidden');
      tabLogin?.classList.add('active');
      tabRegister?.classList.remove('active');
    } else {
      loginForm?.classList.add('hidden');
      registerForm?.classList.remove('hidden');
      tabLogin?.classList.remove('active');
      tabRegister?.classList.add('active');
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
    const ids = ['tabLogin','tabRegister','btnGuest','formLogin','formRegister'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
    });

    document.getElementById('tabLogin')
      ?.addEventListener('click', () => _showTab('login'));
    document.getElementById('tabRegister')
      ?.addEventListener('click', () => _showTab('register'));
    document.getElementById('formLogin')
      ?.addEventListener('submit', e => { e.preventDefault(); _handleLogin(); });
    document.getElementById('formRegister')
      ?.addEventListener('submit', e => { e.preventDefault(); _handleRegister(); });
    document.getElementById('btnGuest')
      ?.addEventListener('click', () => _handleGuest());
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
  // REGISTER
  // ─────────────────────────────────────────────
  async function _handleRegister() {
    const FA       = window.FirebaseAuth;
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

    _setLoading(true);
    try {
      const result = await FA.createUserWithEmailAndPassword(FA.auth, email, password);
      _currentUser = result.user;

      // Update display name to username
      const { updateProfile } = await import(
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
      );
      await updateProfile(_currentUser, { displayName: username });

      _showMsg(`Account created! Welcome, ${username}!`, 'success');
      setTimeout(() => GameManager.navigate('MENU'), 800);
    } catch (err) {
      _setLoading(false);
      _showMsg(_firebaseError(err.code), 'error');
    }
  }

  // ─────────────────────────────────────────────
  // GUEST
  // ─────────────────────────────────────────────
  function _handleGuest() {
    _currentUser = null;
    GameManager.navigate('MENU');
  }

  // ─────────────────────────────────────────────
  // FIREBASE ERROR MESSAGES (human-readable)
  // ─────────────────────────────────────────────
  function _firebaseError(code) {
    const map = {
      'auth/user-not-found':       'Account not found. Please register first.',
      'auth/wrong-password':       'Incorrect password. Try again.',
      'auth/email-already-in-use': 'Email already registered. Please login.',
      'auth/invalid-email':        'Invalid email address.',
      'auth/weak-password':        'Password must be at least 6 characters.',
      'auth/too-many-requests':    'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/invalid-credential':   'Invalid email or password.',
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
