(() => {
  'use strict';

  // Mobile navigation toggle
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Hero workspace preview tabs (synced between rail icons & pill tabs)
  const tabButtons = document.querySelectorAll('[data-mock-tab]');
  const panels = document.querySelectorAll('[data-mock-panel]');
  function setMockTab(name) {
    tabButtons.forEach((btn) => {
      const active = btn.dataset.mockTab === name;
      btn.classList.toggle('active', active);
      if (btn.getAttribute('role') === 'tab') {
        btn.setAttribute('aria-selected', String(active));
      }
    });
    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.mockPanel === name);
    });
  }
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => setMockTab(btn.dataset.mockTab));
  });

  // Hero mockup privacy-keys & screen-share blur toggles
  const previewShell = document.getElementById('preview-shell');
  const privacyBtn = document.getElementById('mock-privacy-btn');
  const blurBtn = document.getElementById('mock-blur-btn');
  let keysOnly = true;

  if (privacyBtn) {
    privacyBtn.addEventListener('click', () => {
      keysOnly = !keysOnly;
      privacyBtn.classList.toggle('on', keysOnly);
      privacyBtn.setAttribute('aria-pressed', String(keysOnly));
      privacyBtn.textContent = keysOnly ? 'Keys: On' : 'Keys: Off';
      document.querySelectorAll('.mock-student').forEach((el) => {
        el.textContent = keysOnly ? el.dataset.key : el.dataset.name;
      });
    });
  }

  if (blurBtn && previewShell) {
    blurBtn.addEventListener('click', () => {
      const blurred = previewShell.classList.toggle('is-blurred');
      blurBtn.classList.toggle('on', blurred);
      blurBtn.setAttribute('aria-pressed', String(blurred));
      blurBtn.textContent = blurred ? 'Blur: On' : 'Blur';
    });
  }

  // Interactive Grading Queue preview buttons
  document.querySelectorAll('[data-q-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.qTarget);
      if (!target) return;
      const act = btn.dataset.qAction;
      target.className = 'tag';
      if (act === 'approve') {
        target.classList.add('good');
        target.textContent = 'Approved · Ready for Canvas';
      } else if (act === 'confirm') {
        target.classList.add('good');
        target.textContent = 'Image confirmed & approved';
      } else {
        target.classList.add('warn');
        target.textContent = 'Held for teacher review';
      }
    });
  });

  // Compliance Rule Explorer (V1-V6 + H)
  const RULES = {
    V1: {
      badge: 'Violation V1',
      tone: 'bad',
      title: 'Late deduction inside extended window',
      trigger: 'Triggered when Canvas applies a late point penalty (points_deducted > 0) even though the student submitted on or before their individualized extended due date.',
      risk: 'Automated Canvas late policies penalize the base class due date unless a matching student override is already in place.',
      fixTitle: 'Remove late deduction & clear late penalty status',
      fixNote: 'Queues a neutral status update (extended) and restores penalized points—never writing to Canvas until you click Approve.'
    },
    V2: {
      badge: 'Violation V2',
      tone: 'bad',
      title: 'Missing or zero score while window is open',
      trigger: 'Triggered when an assignment carries a score of 0 or the Canvas missing flag while the student\'s individualized deadline is still in the future.',
      risk: 'Early zeros distort student progress and discourage completion during legitimate IEP or 504 work time.',
      fixTitle: 'Clear missing flag & hold zero deduction',
      fixNote: 'Adds the item to your pre-grading hard-stop list and prepares a clean status reset for approval.'
    },
    V3: {
      badge: 'Violation V3',
      tone: 'warn',
      title: 'Wrong late label on on-time extended work',
      trigger: 'Triggered when Canvas marks a submission late even though submitted_at falls inside the student\'s extended window.',
      risk: 'Inaccurate late badges misrepresent compliance history to parents, counselors, and case managers.',
      fixTitle: 'Switch Canvas label to neutral status',
      fixNote: 'Updates the Canvas late-policy status to a neutral non-penalized label with zero mention of IEP or 504 terms.'
    },
    V4: {
      badge: 'Violation V4',
      tone: 'warn',
      title: 'Ungraded past extended window + grace period',
      trigger: 'Triggered when a student submitted work and the extended deadline plus your configured grace days have passed without a grade.',
      risk: 'Extended-time submissions are easy to overlook after the main class batch has already been graded.',
      fixTitle: 'Surface submission at top of Grading Queue',
      fixNote: 'Opens a direct SpeedGrader / draft-review link so late-window submissions never sit ungraded.'
    },
    V5: {
      badge: 'Violation V5',
      tone: 'warn',
      title: 'No per-student due-date override in Canvas',
      trigger: 'Triggered when an assignment has students with extended-time plans, override data is loaded, and Canvas still lacks a matching per-student override.',
      risk: 'Missing overrides cause Canvas to lock quizzes early or trigger automatic late penalties on submission.',
      fixTitle: 'Prepare grouped Canvas due-date overrides',
      fixNote: 'Batches students sharing the same extended date into one clean Canvas override request for your approval.'
    },
    V6: {
      badge: 'Violation V6',
      tone: 'info',
      title: 'Timed quiz missing extra-time moderation',
      trigger: 'Triggered on timed Canvas quizzes when a student\'s test accommodation requires +50% or +100% extra minutes and Canvas moderation is missing or shorter than required.',
      risk: 'Extra-time accommodations on timed assessments apply to quiz minutes—not just the calendar due date.',
      fixTitle: 'Calculate exact total quiz minutes & queue moderation',
      fixNote: 'Shows base minutes plus exact required extra minutes (e.g., 60m → 90m or 120m) ready to apply once approved.'
    },
    H: {
      badge: 'Hold · Human Review',
      tone: 'info',
      title: 'Ambiguous or expired rule placed on Hold',
      trigger: 'Triggered when plan wording is unclear, specifies "150%" without clarifying total vs. extra time, or the plan\'s review/end date has passed.',
      risk: 'Guessing an ambiguous accommodation rule risks either under-serving a student or applying an incorrect override.',
      fixTitle: 'No auto-date & no auto-violation—held for teacher decision',
      fixNote: 'Keeps the item safely flagged as Needs Review until you confirm the exact timing rule in Settings or the Student drawer.'
    }
  };

  const rulePills = document.querySelectorAll('[data-rule]');
  const ruleBadge = document.getElementById('rule-badge');
  const ruleTitle = document.getElementById('rule-title');
  const ruleTrigger = document.getElementById('rule-trigger');
  const ruleRisk = document.getElementById('rule-risk');
  const ruleFixTitle = document.getElementById('rule-fix-title');
  const ruleFixNote = document.getElementById('rule-fix-note');

  rulePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const r = RULES[pill.dataset.rule];
      if (!r) return;
      rulePills.forEach((p) => {
        const on = p === pill;
        p.classList.toggle('active', on);
        p.setAttribute('aria-selected', String(on));
      });
      if (ruleBadge) {
        ruleBadge.className = 'tag ' + r.tone;
        ruleBadge.textContent = r.badge;
      }
      if (ruleTitle) ruleTitle.textContent = r.title;
      if (ruleTrigger) ruleTrigger.textContent = r.trigger;
      if (ruleRisk) ruleRisk.innerHTML = '<strong>Why it matters:</strong> ' + r.risk;
      if (ruleFixTitle) ruleFixTitle.textContent = r.fixTitle;
      if (ruleFixNote) ruleFixNote.textContent = r.fixNote;
    });
  });

  // Netlify Forms AJAX submission
  const form = document.getElementById('inquiry-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');

  if (form && statusEl && submitBtn) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      statusEl.hidden = true;
      statusEl.className = 'form-status';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const body = new URLSearchParams(new FormData(form)).toString();
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        statusEl.className = 'form-status ok';
        statusEl.textContent = 'Thanks! Your inquiry was sent to TeacherDesk. We will reply shortly.';
        statusEl.hidden = false;
      } catch (err) {
        statusEl.className = 'form-status err';
        statusEl.textContent = 'Could not submit right now. Please try again on https://teacherdesk.org or email flaser007@gmail.com.';
        statusEl.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry →';
      }
    });
  }
})();
