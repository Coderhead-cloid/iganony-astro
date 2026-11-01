/**
 * DolphinRadar Pro Dynamic JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initRadarChart();
    initModals();
    initRescanTrigger();
    initCheckoutSimulation();
});

// Toast notification helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl flex items-center gap-3 shadow-lg border backdrop-blur-md transform transition-all duration-300 translate-y-2 opacity-0 ${
        type === 'success' 
            ? 'bg-[#131627]/95 border-[#10B981]/50 text-white' 
            : 'bg-[#131627]/95 border-[#EF4444]/50 text-white'
    }`;
    
    const icon = type === 'success' 
        ? '<i class="fa-solid fa-circle-check text-[#10B981] text-lg"></i>' 
        : '<i class="fa-solid fa-triangle-exclamation text-[#EF4444] text-lg"></i>';

    toast.innerHTML = `
        ${icon}
        <div class="text-sm font-medium">${message}</div>
        <button onclick="this.parentElement.remove()" class="ml-auto text-gray-400 hover:text-white">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

// Tab switcher logic
function initTabs() {
    const tabButtons = document.querySelectorAll('[data-tab-target]');
    const tabPanels = document.querySelectorAll('[data-tab-content]');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab-target');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.add('hidden'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
            }
        });
    });
}

// Chart.js Active Hours line / radar chart
function initRadarChart() {
    const ctx = document.getElementById('activeHoursChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const hourlyDataElement = document.getElementById('hourly-data-json');
    if (!hourlyDataElement) return;

    try {
        const rawData = JSON.parse(hourlyDataElement.textContent);
        const labels = rawData.map(d => d.hour);
        const scores = rawData.map(d => d.score);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Activity Intensity (Likes, Follows & Comments)',
                    data: scores,
                    borderColor: '#725CFF',
                    backgroundColor: 'rgba(114, 92, 255, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: scores.map((s, idx) => (idx >= 1 && idx <= 4) ? '#EC4899' : '#00F0FF'),
                    pointBorderColor: '#FFFFFF',
                    pointRadius: scores.map((s, idx) => (idx >= 1 && idx <= 4) ? 6 : 4),
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#94A3B8',
                            font: { family: 'Inter', size: 13 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                if (index >= 1 && index <= 4) {
                                    return '⚠️ Late-Night Alert Window';
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748B' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748B' }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Failed to initialize chart', e);
    }
}

// Live Re-scan Trigger
function initRescanTrigger() {
    const btn = document.getElementById('btn-rescan-account');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const accountId = btn.getAttribute('data-account-id');
        const icon = btn.querySelector('i');
        
        btn.disabled = true;
        if (icon) icon.classList.add('fa-spin');
        btn.classList.add('opacity-75');

        showToast('Initiating real-time telemetry scan across Instagram nodes...', 'success');

        try {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account_id: parseInt(accountId) })
            });

            const data = await res.json();

            if (data.success) {
                showToast(`Scan Complete! 1 new follow activity detected: @${data.new_event.target_username}`, 'success');
                
                // Update scan timestamps in UI
                const lastScanEl = document.getElementById('last-scanned-text');
                if (lastScanEl) {
                    lastScanEl.textContent = 'Just now';
                }

                // If on follows tab, reload in 1.5s to show newly inserted record
                setTimeout(() => {
                    window.location.reload();
                }, 1800);
            } else {
                showToast(data.error || 'Scan failed', 'error');
            }
        } catch (err) {
            showToast('Network error during scan execution', 'error');
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                if (icon) icon.classList.remove('fa-spin');
                btn.classList.remove('opacity-75');
            }, 1000);
        }
    });
}

// Modal handling
function initModals() {
    // Generic modal opener
    document.querySelectorAll('[data-open-modal]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-open-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        });
    });

    // Generic modal closer
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-container');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });
    });
}

// Stripe Checkout Simulation
function initCheckoutSimulation() {
    const form = document.getElementById('stripe-checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const emailInput = form.querySelector('input[name="email"]');
        const planInput = form.querySelector('input[name="plan"]:checked') || { value: 'quarterly' };

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Connecting to Stripe Secure Gateway...';

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput.value,
                    plan: planInput.value
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard?subscribed=1';
                }, 1500);
            } else {
                showToast(data.error || 'Payment simulation failed', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Complete Purchase';
            }
        } catch (err) {
            showToast('Connection error during checkout', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Complete Purchase';
        }
    });
}

// Media Lightbox Modal & Downloader
let currentModalItem = null;
let currentCarouselIndex = 0;

function openMediaModal(item) {
    const modal = document.getElementById('modal-media-viewer');
    if (!modal) return;

    currentModalItem = item;
    currentCarouselIndex = 0;

    const imgEl = document.getElementById('modal-media-img');
    const videoEl = document.getElementById('modal-media-video');
    const typeChip = document.getElementById('modal-media-type-chip');
    const authorAvatar = document.getElementById('modal-author-avatar');
    const authorHandle = document.getElementById('modal-author-handle');
    const mediaDate = document.getElementById('modal-media-date');
    const captionEl = document.getElementById('modal-media-caption');
    const likesEl = document.getElementById('modal-media-likes');
    const commentsEl = document.getElementById('modal-media-comments');
    const downloadBtn = document.getElementById('modal-btn-download');
    const igLink = document.getElementById('modal-ig-link');
    const carouselNav = document.getElementById('modal-carousel-nav');

    if (item.type === 'reel') {
        if (carouselNav) carouselNav.classList.add('hidden');
        imgEl.classList.add('hidden');
        videoEl.classList.remove('hidden');
        videoEl.src = item.videoUrl || item.url;
        typeChip.textContent = 'REEL VIDEO';
        typeChip.className = 'absolute top-4 left-4 badge badge-rose text-xs shadow-lg';
    } else {
        videoEl.classList.add('hidden');
        videoEl.pause();
        videoEl.src = '';
        imgEl.classList.remove('hidden');
        imgEl.src = item.url;

        // Check if carousel
        if (item.carousel && Array.isArray(item.carousel) && item.carousel.length > 1) {
            typeChip.textContent = `CAROUSEL (${item.carousel.length} SLIDES)`;
            typeChip.className = 'absolute top-4 left-4 badge badge-cyan text-xs shadow-lg';
            if (carouselNav) {
                carouselNav.classList.remove('hidden');
                updateCarouselUI();
            }
        } else {
            if (carouselNav) carouselNav.classList.add('hidden');
            typeChip.textContent = (item.type === 'tagged') ? `TAGGED BY @${item.taggedBy || item.author}` : 'HIGH-RES PHOTO';
            typeChip.className = (item.type === 'tagged') ? 'absolute top-4 left-4 badge badge-purple text-xs shadow-lg' : 'absolute top-4 left-4 badge badge-cyan text-xs shadow-lg';
        }
    }

    authorAvatar.src = item.authorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.author;
    authorHandle.textContent = '@' + item.author;
    mediaDate.textContent = item.date || 'Recent';
    captionEl.textContent = item.caption || 'No caption provided.';
    likesEl.textContent = Number(item.likes || 0).toLocaleString();
    commentsEl.textContent = item.comments ? Number(item.comments).toLocaleString() : 'N/A';

    const fileExt = (item.type === 'reel') ? 'mp4' : 'jpg';
    const targetUrl = (item.type === 'reel' && item.videoUrl) ? item.videoUrl : item.url;
    downloadBtn.href = `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(item.author + '_' + (item.shortcode || item.type) + '.' + fileExt)}`;

    if (igLink) {
        if (item.shortcode) {
            igLink.href = `https://www.instagram.com/p/${item.shortcode}/`;
            igLink.classList.remove('hidden');
        } else {
            igLink.href = `https://www.instagram.com/${item.author}/`;
        }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function updateCarouselUI() {
    if (!currentModalItem || !currentModalItem.carousel) return;
    const slides = currentModalItem.carousel;
    const imgEl = document.getElementById('modal-media-img');
    const counterEl = document.getElementById('modal-carousel-counter');
    const downloadBtn = document.getElementById('modal-btn-download');

    const cur = slides[currentCarouselIndex];
    const slideUrl = cur.media_url || cur.thumbnail_url;
    if (slideUrl && imgEl) {
        imgEl.src = slideUrl;
    }
    if (counterEl) {
        counterEl.textContent = `${currentCarouselIndex + 1}/${slides.length}`;
    }
    if (downloadBtn && slideUrl) {
        downloadBtn.href = `/api/download?url=${encodeURIComponent(slideUrl)}&filename=${encodeURIComponent(currentModalItem.author + '_slide_' + (currentCarouselIndex + 1) + '.jpg')}`;
    }
}

// Carousel button listeners
document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.getElementById('modal-carousel-prev');
    const nextBtn = document.getElementById('modal-carousel-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!currentModalItem || !currentModalItem.carousel) return;
            const len = currentModalItem.carousel.length;
            currentCarouselIndex = (currentCarouselIndex - 1 + len) % len;
            updateCarouselUI();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!currentModalItem || !currentModalItem.carousel) return;
            const len = currentModalItem.carousel.length;
            currentCarouselIndex = (currentCarouselIndex + 1) % len;
            updateCarouselUI();
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMediaModal();
        }
    });
});

function closeMediaModal() {
    const modal = document.getElementById('modal-media-viewer');
    if (!modal) return;
    const videoEl = document.getElementById('modal-media-video');
    if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
    }
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function copyModalCaption() {
    const captionEl = document.getElementById('modal-media-caption');
    if (!captionEl) return;
    navigator.clipboard.writeText(captionEl.textContent).then(() => {
        showToast('Caption copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Unable to copy to clipboard', 'error');
    });
}
