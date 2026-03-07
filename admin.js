// admin.js

// Auth Check
if (localStorage.getItem('odyssey_admin_auth') !== 'true') {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // Logout handling
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('odyssey_admin_auth');
            window.location.href = 'login.html';
        });
    }

    // --- TAB SWITCHING ---
    const tabs = document.querySelectorAll('.admin-tab');
    const sections = document.querySelectorAll('.admin-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`section-${tab.dataset.tab}`).classList.add('active');
        });
    });

    // --- 1. PRIZE LIST MANAGEMENT ---
    const adminForm = document.getElementById('admin-form');
    const winnersTbody = document.getElementById('admin-winners-tbody');
    const clearWinnersBtn = document.getElementById('clear-winners-btn');

    loadAdminWinners();

    adminForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = document.getElementById('event-name').value;
        const prize1Name = document.getElementById('prize-1-name').value.trim();
        const prize1College = document.getElementById('prize-1-college').value.trim();
        const prize2Name = document.getElementById('prize-2-name').value.trim();
        const prize2College = document.getElementById('prize-2-college').value.trim();
        const prize3Name = document.getElementById('prize-3-name').value.trim();
        const prize3College = document.getElementById('prize-3-college').value.trim();

        if (!eventName) {
            alert('Please select an event');
            return;
        }

        const newWinner = {
            id: Date.now().toString(),
            eventName,
            prize1Name: prize1Name || '—',
            prize1College: prize1College || '—',
            prize2Name: prize2Name || '—',
            prize2College: prize2College || '—',
            prize3Name: prize3Name || '—',
            prize3College: prize3College || '—',
            timestamp: new Date().toISOString()
        };

        // Get existing or create new array
        let winners = JSON.parse(localStorage.getItem('odyssey2k26_winners') || '[]');

        // Remove existing entry for the same event to update it
        winners = winners.filter(w => w.eventName !== eventName);
        winners.push(newWinner);

        localStorage.setItem('odyssey2k26_winners', JSON.stringify(winners));

        loadAdminWinners();
        showSuccess(adminForm.querySelector('button'), 'Updated!');
        adminForm.reset();
    });

    clearWinnersBtn.addEventListener('click', () => {
        if (confirm('Delete ALL published prizes? This cannot be undone.')) {
            localStorage.removeItem('odyssey2k26_winners');
            loadAdminWinners();
        }
    });

    function loadAdminWinners() {
        const saved = localStorage.getItem('odyssey2k26_winners');
        winnersTbody.innerHTML = '';

        if (!saved) {
            winnersTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #a0a0b0;">No prizes published yet.</td></tr>`;
            return;
        }

        const winners = JSON.parse(saved);
        if (winners.length === 0) {
            winnersTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #a0a0b0;">No prizes published yet.</td></tr>`;
            return;
        }

        const reversed = [...winners].reverse();

        reversed.forEach(winner => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td><strong>${winner.eventName}</strong></td>
                <td>${winner.prize1Name}<br><small style="color:var(--text-secondary)">${winner.prize1College}</small></td>
                <td>${winner.prize2Name}<br><small style="color:var(--text-secondary)">${winner.prize2College}</small></td>
                <td>${winner.prize3Name}<br><small style="color:var(--text-secondary)">${winner.prize3College}</small></td>
                <td>
                    <button class="delete-btn delete-winner-btn" data-id="${winner.id}" title="Delete">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>
                </td>
            `;
            winnersTbody.appendChild(tr);
        });

        lucide.createIcons();

        document.querySelectorAll('.delete-winner-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                if (!confirm('Delete this record?')) return;
                let winners = JSON.parse(localStorage.getItem('odyssey2k26_winners') || '[]');
                winners = winners.filter(w => w.id !== this.getAttribute('data-id'));
                localStorage.setItem('odyssey2k26_winners', JSON.stringify(winners));
                loadAdminWinners();
            });
        });
    }

    // --- 2. SCHEDULE MANAGEMENT ---
    const scheduleForm = document.getElementById('schedule-form');
    const scheduleTbody = document.getElementById('admin-schedule-tbody');

    if (scheduleForm) {
        loadAdminSchedule();

        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const time = document.getElementById('schedule-time').value.trim();
            const event = document.getElementById('schedule-event').value.trim();
            const category = document.getElementById('schedule-category').value.trim();
            const venue = document.getElementById('schedule-venue').value.trim();

            if (!time || !event) return;

            const newItem = {
                id: Date.now().toString(),
                time, event, category, venue
            };

            let schedule = JSON.parse(localStorage.getItem('odyssey2k26_schedule') || '[]');
            schedule.push(newItem);
            localStorage.setItem('odyssey2k26_schedule', JSON.stringify(schedule));

            loadAdminSchedule();
            showSuccess(scheduleForm.querySelector('button'), 'Saved!');
            scheduleForm.reset();
        });
    }

    function loadAdminSchedule() {
        const schedule = JSON.parse(localStorage.getItem('odyssey2k26_schedule') || '[]');
        if (!scheduleTbody) return;
        scheduleTbody.innerHTML = '';

        if (schedule.length === 0) {
            scheduleTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #a0a0b0;">Schedule is empty.</td></tr>`;
            return;
        }

        schedule.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.time}</td>
                <td><strong>${item.event}</strong><br><small style="color:var(--text-secondary)">${item.category}</small></td>
                <td>${item.venue}</td>
                <td>
                    <button class="delete-btn delete-schedule-btn" data-id="${item.id}" title="Delete">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>
                </td>
            `;
            scheduleTbody.appendChild(tr);
        });

        lucide.createIcons();

        document.querySelectorAll('.delete-schedule-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                if (!confirm('Delete this schedule item?')) return;
                let schedule = JSON.parse(localStorage.getItem('odyssey2k26_schedule') || '[]');
                schedule = schedule.filter(s => s.id !== this.getAttribute('data-id'));
                localStorage.setItem('odyssey2k26_schedule', JSON.stringify(schedule));
                loadAdminSchedule();
            });
        });
    }

    // --- 3. CONTACTS MANAGEMENT ---
    const contactForm = document.getElementById('contact-form-admin');
    const staffContainer = document.getElementById('staff-contacts-container');
    const studentContainer = document.getElementById('student-contacts-container');

    if (contactForm) {
        document.getElementById('add-staff-btn').addEventListener('click', () => addContactInput(staffContainer, 'staff'));
        document.getElementById('add-student-btn').addEventListener('click', () => addContactInput(studentContainer, 'student'));

        loadAdminContacts();

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const contacts = { staff: [], student: [] };

            staffContainer.querySelectorAll('.contact-row').forEach(div => {
                const name = div.querySelector('.contact-name').value.trim();
                const phone = div.querySelector('.contact-phone').value.trim();
                if (name || phone) contacts.staff.push({ name, phone });
            });

            studentContainer.querySelectorAll('.contact-row').forEach(div => {
                const name = div.querySelector('.contact-name').value.trim();
                const phone = div.querySelector('.contact-phone').value.trim();
                if (name || phone) contacts.student.push({ name, phone });
            });

            localStorage.setItem('odyssey2k26_contacts', JSON.stringify(contacts));
            showSuccess(contactForm.querySelector('button'), 'Saved Contacts!');
        });
    }

    function addContactInput(container, type, name = '', phone = '') {
        const div = document.createElement('div');
        div.className = 'contact-row';
        div.style.display = 'flex';
        div.style.gap = '10px';
        div.style.marginBottom = '10px';
        div.innerHTML = `
            <input type="text" placeholder="Name" value="${name}" class="contact-name" style="flex:1; padding: 10px; border-radius: 4px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.5); color: white;">
            <input type="text" placeholder="Phone" value="${phone}" class="contact-phone" style="flex:1; padding: 10px; border-radius: 4px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.5); color: white;">
            <button type="button" class="btn-sm delete-contact-input" style="padding: 10px;"><i data-lucide="x"></i></button>
        `;
        container.appendChild(div);
        lucide.createIcons();

        div.querySelector('.delete-contact-input').addEventListener('click', () => div.remove());
    }

    function loadAdminContacts() {
        // Defaults to user request
        const defaultContacts = {
            staff: [
                { name: 'Dr. A. Astalin Melba', phone: '9047659356' },
                { name: 'Mrs. A. Bindhu', phone: '8925246460' }
            ],
            student: [
                { name: 'Ms. Evelin K. E.', phone: '9080460176' },
                { name: 'Mr. Gokul', phone: '9042816515' }
            ]
        };

        const saved = JSON.parse(localStorage.getItem('odyssey2k26_contacts') || JSON.stringify(defaultContacts));

        staffContainer.innerHTML = '';
        studentContainer.innerHTML = '';

        if (saved.staff.length === 0) addContactInput(staffContainer, 'staff');
        else saved.staff.forEach(c => addContactInput(staffContainer, 'staff', c.name, c.phone));

        if (saved.student.length === 0) addContactInput(studentContainer, 'student');
        else saved.student.forEach(c => addContactInput(studentContainer, 'student', c.name, c.phone));
    }

    // --- 4. MESSAGES MANAGEMENT ---
    const messagesTbody = document.getElementById('admin-messages-tbody');
    const clearMessagesBtn = document.getElementById('clear-messages-btn');

    if (messagesTbody) {
        loadAdminMessages();
    }

    if (clearMessagesBtn) {
        clearMessagesBtn.addEventListener('click', () => {
            if (confirm('Delete ALL user messages?')) {
                localStorage.removeItem('odyssey2k26_user_messages');
                loadAdminMessages();
            }
        });
    }

    function loadAdminMessages() {
        const saved = localStorage.getItem('odyssey2k26_user_messages');
        if (!messagesTbody) return;
        messagesTbody.innerHTML = '';

        if (!saved) {
            messagesTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #a0a0b0;">No messages yet.</td></tr>`;
            return;
        }

        const messages = JSON.parse(saved);
        if (messages.length === 0) {
            messagesTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #a0a0b0;">No messages yet.</td></tr>`;
            return;
        }

        const reversed = [...messages].reverse();

        reversed.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleString();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${msg.name}</strong><br><small style="color:var(--text-secondary)">${msg.email}</small></td>
                <td><div style="max-width:300px; white-space: normal; line-height: 1.4;">${msg.message}</div></td>
                <td><small>${date}</small></td>
                <td>
                    <button class="delete-btn delete-msg-btn" data-id="${msg.id}" title="Delete">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>
                    ${msg.status === 'unread' ? '<span class="badge" style="display:inline-block; font-size:0.6rem; padding: 2px 5px;">New</span>' : ''}
                </td>
            `;
            messagesTbody.appendChild(tr);
        });

        lucide.createIcons();

        document.querySelectorAll('.delete-msg-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                if (!confirm('Delete this message?')) return;
                let messages = JSON.parse(localStorage.getItem('odyssey2k26_user_messages') || '[]');
                messages = messages.filter(m => m.id !== this.getAttribute('data-id'));
                localStorage.setItem('odyssey2k26_user_messages', JSON.stringify(messages));
                loadAdminMessages();
            });
        });
    }

    // --- UTILS ---
    function showSuccess(btn, msg) {
        const originalText = btn.innerHTML;
        btn.innerHTML = `${msg} <i data-lucide="check-circle"></i>`;
        btn.style.background = '#00cc66';
        lucide.createIcons();

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            lucide.createIcons();
        }, 2000);
    }
});
