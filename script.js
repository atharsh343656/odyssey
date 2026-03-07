/**
 * ODYSSEY 2K26 - Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Navigation Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-links a');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const isActive = navLinks.classList.contains('active');
        menuToggle.innerHTML = isActive ? `<i data-lucide="x"></i>` : `<i data-lucide="menu"></i>`;
        lucide.createIcons();
    });

    // Close mobile menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = `<i data-lucide="menu"></i>`;
            lucide.createIcons();
        });
    });

    // 2. Navbar Scroll Effect (Blur & Transparency)
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal Animation Observer
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => el.classList.remove('active')); // Reset initial state
    setTimeout(() => {
        revealElements.forEach(el => revealObserver.observe(el));
    }, 100);

    // 4. Smooth Scrolling Logic & Active State Updater
    const sections = document.querySelectorAll('section, header');
    window.addEventListener('scroll', () => {
        let currentId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 200)) {
                currentId = section.getAttribute('id');
            }
        });

        links.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(currentId)) {
                li.classList.add('active');
            }
        });
    });

    // 5. Registration Form Submit Handling
    const regForm = document.getElementById('registration-form');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = regForm.querySelector('.submit-btn');
            const originalHTML = btn.innerHTML;
            
            // Visual feedback
            btn.innerHTML = 'Registered Successfully! <i data-lucide="check-circle"></i>';
            btn.style.background = 'linear-gradient(135deg, #00FF88, #00B366)';
            btn.style.boxShadow = '0 0 20px rgba(0,255,136,0.5)';
            lucide.createIcons();
            
            // Reset form
            regForm.reset();
            
            // Revert button
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.boxShadow = '';
                lucide.createIcons();
            }, 4000);
        });
    }

    // Contact Form Submit Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalHTML = btn.innerHTML;
            
            btn.innerHTML = 'Message Sent! <i data-lucide="check"></i>';
            lucide.createIcons();
            contactForm.reset();
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                lucide.createIcons();
            }, 3000);
        });
    }

    // 6. Live Winners Board Logic (Google Sheets Integration)
    // IMPORTANT: Replace this placeholder string with the URL you got from deploying `google_apps_script.js`
    const GOOGLE_SHEET_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"; 
    
    // Fallback Mock Data for testing if actual URL is not provided yet
    const MOCK_DATA = [
        { event: "Foot Loose", winner: "Sarah Jenkins", college: "Vanguard Arts" },
        { event: "Melody Mania", winner: "David Kim", college: "City College" },
        { event: "Mind Marathon", winner: "Team Alpha", college: "Tech Institute" },
        { event: "Elite Walk", winner: "Updating...", college: "—" },
        { event: "Pixel Hunt", winner: "Updating...", college: "—" },
        { event: "Henna Harmony", winner: "Updating...", college: "—" },
        { event: "Hue and You", winner: "Updating...", college: "—" },
        { event: "Junk Yard", winner: "Updating...", college: "—" },
        { event: "Art Arena", winner: "Updating...", college: "—" }
    ];

    async function fetchWinnersData() {
        const tbody = document.getElementById('live-winners-body');
        if (!tbody) return;

        try {
            // Add a loading state to first row while fetching
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--secondary);">Fetching live results...</td></tr>`;
            
            let finalData = [];
            
            // If the user hasn't replaced the URL, show the demo data so they can see the layout
            if (GOOGLE_SHEET_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE" || !GOOGLE_SHEET_URL) {
                console.log("Using Mock Data. Replace GOOGLE_SHEET_URL with real script URL for live Google Sheets sync!");
                finalData = MOCK_DATA;
                
                // Simulate network delay for effect
                await new Promise(resolve => setTimeout(resolve, 800));
            } else {
                // Fetch actual data from Google Sheets API
                const response = await fetch(GOOGLE_SHEET_URL);
                if (!response.ok) throw new Error("Network response was not ok");
                finalData = await response.json();
            }

            renderWinnersTable(finalData, tbody);

        } catch (error) {
            console.error("Failed to fetch live winners:", error);
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--primary);">Failed to connect to results server. Please try again later.</td></tr>`;
        }
    }

    function renderWinnersTable(dataArray, tbodyElement) {
        tbodyElement.innerHTML = ''; // Clear existing rows

        if (dataArray.length === 0) {
            tbodyElement.innerHTML = `<tr><td colspan="3" style="text-align: center;">No results posted yet. Check back soon!</td></tr>`;
            return;
        }

        dataArray.forEach(item => {
            const tr = document.createElement('tr');
            
            // Determine styling based on whether the result is announced
            const isUpdating = (item.winner.toLowerCase().includes('update') || item.winner === '—' || !item.winner);
            
            const winnerHtml = isUpdating 
                ? `<span class="updating-pulse">Updating...</span>` 
                : `<strong style="color: white; text-shadow: 0 0 5px rgba(255,255,255,0.5);">${item.winner}</strong>`;

            const collegeHtml = isUpdating || item.college === '—' || !item.college 
                ? '—' 
                : `<span style="color: var(--secondary);">${item.college}</span>`;

            tr.innerHTML = `
                <td><strong>${item.event}</strong></td>
                <td>${winnerHtml}</td>
                <td>${collegeHtml}</td>
            `;
            tbodyElement.appendChild(tr);
        });
    }

    // Initial Fetch
    fetchWinnersData();
    
    // Auto-refresh the live winners board every 30 seconds
    setInterval(fetchWinnersData, 30000); 
});
