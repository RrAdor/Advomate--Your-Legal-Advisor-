    // Add smooth scrolling and fade-in animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Observe all value cards, team members, and stat items
    document.querySelectorAll('.value-card, .team-member, .stat-item').forEach(el => {
        observer.observe(el);
    });

    // Add hover effects for interactive elements
    document.querySelectorAll('.value-card, .team-member').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Animate statistics on scroll
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateStats = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const isPercentage = finalValue.includes('%');
                const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
                
                // Prevent animation if numericValue is 0 or NaN
                if (!numericValue || numericValue <= 0) {
                    return;
                }
                
                let current = 0;
                const increment = numericValue / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= numericValue) {
                        current = numericValue;
                        clearInterval(timer);
                    }
                    
                    if (isPercentage) {
                        target.textContent = Math.floor(current) + '%';
                    } else if (finalValue.includes('+')) {
                        target.textContent = Math.floor(current).toLocaleString() + '+';
                    } else if (finalValue.includes('/')) {
                        target.textContent = Math.floor(current) + '/7';
                    } else {
                        target.textContent = Math.floor(current).toLocaleString();
                    }
                }, 50);
                
                // Mark as animated to prevent re-animation
                target.setAttribute('data-animated', 'true');
            }
        });
    };

    const statsObserver = new IntersectionObserver(animateStats, { threshold: 0.5 });
    statNumbers.forEach(stat => {
        // Only observe if not already animated
        if (!stat.getAttribute('data-animated')) {
            statsObserver.observe(stat);
        }
    });
});