// ---- Email sending (Web3Forms: free, no server, no activation email) ----
    // 1) Go to https://web3forms.com, enter v.victoryn2025@gmail.com, get the access key by email.
    // 2) Paste it below. Done. Messages then arrive straight in that inbox.
    const WEB3FORMS_KEY = 'PASTE_YOUR_ACCESS_KEY_HERE';

    async function sendEmail(fields) {
      if (!WEB3FORMS_KEY || WEB3FORMS_KEY.startsWith('PASTE_')) return false;
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...fields })
        });
        const data = await res.json();
        return res.ok && data.success === true;
      } catch (err) {
        return false;
      }
    }

    function showResult(banner, textId, ok, okText) {
      banner.classList.remove('hidden');
      banner.querySelector('.font-bold span').textContent = ok ? 'Sent successfully!' : 'Could not send automatically';
      document.getElementById(textId).textContent = ok
        ? okText
        : 'Please use the link below to send it from your email app instead.';
      showToast(ok ? 'Message sent!' : 'Could not send. Use the email link instead.');
    }

    // Safe icon refresh: page keeps working even if the icon library fails to load
    function refreshIcons() { try { if (window.lucide) window.lucide.createIcons(); } catch (e) {} }
    refreshIcons();
    document.getElementById('footer-year').textContent = new Date().getFullYear();

    // Scroll reveal observer for smooth entrance animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-section').forEach(sec => observer.observe(sec));
    // Fallback: never leave sections invisible
    setTimeout(() => document.querySelectorAll('.reveal-section').forEach(s => s.classList.add('visible')), 1500);

    // Light / Dark theme toggle (Light mode default)
    function toggleDarkMode() {
      const html = document.documentElement;
      html.classList.toggle('dark');
      const isDark = html.classList.contains('dark');
      document.getElementById('theme-icon').setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      refreshIcons();
    }

    // Tab switching for Work History, Education & Skills
    function switchTab(tab) {
      ['work', 'education', 'skills'].forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const content = document.getElementById(`tab-content-${t}`);
        if (t === tab) {
          btn.className = "px-4 py-2 rounded-lg transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5";
          content.classList.remove('hidden');
        } else {
          btn.className = "px-4 py-2 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5";
          content.classList.add('hidden');
        }
      });
    }

    // Search/Filter Skills & Tools
    function filterSkills() {
      const q = document.getElementById('skillSearchInput').value.toLowerCase();
      document.querySelectorAll('.skill-group').forEach(group => {
        group.style.display = group.innerText.toLowerCase().includes(q) ? 'block' : 'none';
      });
    }

    // Modal controls
    function openHireModal(defaultRole) {
      const modal = document.getElementById('hire-modal');
      document.getElementById('hire-confirmation').classList.add('hidden');
      if (defaultRole) {
        const select = document.getElementById('hire-role');
        for (let opt of select.options) {
          if (opt.value.toLowerCase().includes(defaultRole.toLowerCase())) {
            select.value = opt.value;
            break;
          }
        }
      }
      modal.classList.remove('hidden');
    }

    function closeHireModal() {
      document.getElementById('hire-modal').classList.add('hidden');
    }

    // Real Form Submission Handler (Sends directly to Chizirim's Gmail via FormSubmit AJAX + Mailto Fallback)
    async function submitFormInquiry(e, type) {
      e.preventDefault();
      const targetEmail = 'v.victoryn2025@gmail.com';

      if (type === 'contact') {
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const subject = document.getElementById('contact-subject').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        const btn = document.getElementById('contact-submit-btn');
        const banner = document.getElementById('contact-confirmation');
        const mailtoLink = document.getElementById('contact-mailto-backup');

        btn.disabled = true;
        btn.innerHTML = '<span>Sending Message...</span>';

        const mailtoHref = `mailto:${targetEmail}?subject=${encodeURIComponent(subject + ' — From ' + name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
        mailtoLink.href = mailtoHref;

        const ok = await sendEmail({ subject: `Portfolio Inquiry: ${subject}`, from_name: name, email: email, message: message });
        showResult(banner, 'contact-confirmation-text', ok, 'Your message has been delivered to Chizirim.');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i><span>Send Message to Chizirim</span>';
        refreshIcons();
        if (ok) e.target.reset();

      } else if (type === 'hire') {
        const role = document.getElementById('hire-role').value;
        const name = document.getElementById('hire-name').value.trim();
        const email = document.getElementById('hire-email').value.trim();
        const notes = document.getElementById('hire-notes').value.trim();
        const btn = document.getElementById('hire-submit-btn');
        const banner = document.getElementById('hire-confirmation');
        const mailtoLink = document.getElementById('hire-mailto-backup');

        btn.disabled = true;
        btn.innerHTML = '<span>Submitting Request...</span>';

        const mailtoHref = `mailto:${targetEmail}?subject=${encodeURIComponent('Hiring Request: ' + role + ' — ' + name)}&body=${encodeURIComponent(`Role: ${role}\nName/Company: ${name}\nEmail: ${email}\n\nDetails:\n${notes}`)}`;
        mailtoLink.href = mailtoHref;

        const ok = await sendEmail({ subject: `Hiring Request: ${role}`, from_name: name, email: email, message: `Role: ${role}

${notes}` });
        showResult(banner, 'hire-confirmation-text', ok, 'Your request has been delivered to Chizirim.');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i><span>Submit Hiring Request</span>';
        refreshIcons();
        if (ok) e.target.reset();
      }
    }

    // Copy helpers (iFrame-safe)
    function copyText(text, toastMsg) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(toastMsg);
    }

    function copySummaryCV() {
      const summary = `CHIZIRIM VICTORY NWOKO
Remote Virtual Assistant | Administrative Support | Customer Support | Data Entry | Email & Chat Support Specialist | Appointment Setter
Email: v.victoryn2025@gmail.com | Phone: +234 812 016 2621
Availability: Open to Remote Opportunities Worldwide (All Time Zones)

EXPERIENCE:
- Customer Support Officer | MobiHealth International (Jan 2026 - Jul 2026)
- Executive Assistant | Dressbychristy (May 2023 - Oct 2025)
- Assistant Manager | Kbee Naturals (Mar 2021 - Dec 2022) — +15% upselling conversions
- Customer / Sales Service Representative | Zealox Hotels & Suites (Feb 2014 - Dec 2017)

EDUCATION & CERTIFICATIONS:
- B.Sc. Actuarial Science, University of Lagos (2017)
- Diploma in Project Management (In View) — Digital Exchange Academy & Alison
- AI Operations & Customer Experience — HUGO Academy
- Remote IT Skills & Support Training — Digital Witch Academy`;
      copyText(summary, 'Clean CV summary copied to clipboard!');
    }

    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in-up pointer-events-auto';
      toast.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0"></i><span>${message}</span>`;
      document.getElementById('toast-container').appendChild(toast);
      refreshIcons();
      setTimeout(() => toast.remove(), 3500);
    }
