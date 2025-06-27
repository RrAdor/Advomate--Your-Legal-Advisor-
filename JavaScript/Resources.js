        function toggleDescription(button) {
            const card = button.closest('.legal-card');
            const description = card.querySelector('.card-description');

    // Collapse all other descriptions and reset their buttons
    document.querySelectorAll('.legal-card .card-description').forEach(desc => {
        if (desc !== description) {
            desc.classList.remove('visible');
        }
    });
    document.querySelectorAll('.legal-card .btn.btn-primary').forEach(btnEl => {
        if (btnEl !== button) {
            btnEl.textContent = 'Read More';
        }
    });

    if (description.classList.contains('visible')) {
                description.classList.remove('visible');
                button.textContent = 'Read More';
            } else {
                description.classList.add('visible');
                button.textContent = 'Read Less';
            }
        }

        function loadMoreLaws() {
            const additionalSection = document.getElementById('additional-legal-areas');
            const loadMoreBtn = document.getElementById('main-load-more-btn');
            
            if (additionalSection.classList.contains('visible')) {
                // Hide additional cards and collapse all descriptions
                additionalSection.classList.remove('visible');
                loadMoreBtn.textContent = 'Load More Legal Areas';
                // Hide all descriptions in additional section and reset button text
                additionalSection.querySelectorAll('.card-description').forEach(desc => {
                    desc.classList.remove('visible');
                });
                additionalSection.querySelectorAll('.btn.btn-primary').forEach(btn => {
                    btn.textContent = 'Read More';
                });
                document.querySelector('.legal-issues-section').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            } else {
                additionalSection.classList.add('visible');
                loadMoreBtn.textContent = 'Show Less';
                setTimeout(() => {
                    const newCards = additionalSection.querySelectorAll('.legal-card');
                    newCards.forEach((card, index) => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(30px)';
                        setTimeout(() => {
                            card.style.transition = 'all 0.6s ease';
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                    // DO NOT expand all descriptions or change button text here
                }, 100);
                
                setTimeout(() => {
                    additionalSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 200);
            }
        }