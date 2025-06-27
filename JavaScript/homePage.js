
            document.addEventListener('DOMContentLoaded', function() {
            // Testimonial slider functionality
            const testimonialSlides = document.querySelectorAll('.testimonial-slide');
            const testimonialDots = document.querySelectorAll('.testimonial-dot');
            let currentTestimonialSlide = 0;
            
            function showTestimonialSlide(index) {
                testimonialSlides.forEach(slide => {
                    slide.classList.remove('active');
                });
                
                testimonialDots.forEach(dot => {
                    dot.classList.remove('active');
                });
                
                testimonialSlides[index].classList.add('active');
                testimonialDots[index].classList.add('active');
                
                currentTestimonialSlide = index;
            }
            
            testimonialDots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showTestimonialSlide(index);
                });
            });
            
            // Auto-rotate testimonial slides every 5 seconds
            setInterval(() => {
                let nextTestimonialSlide = (currentTestimonialSlide + 1) % testimonialSlides.length;
                showTestimonialSlide(nextTestimonialSlide);
            }, 5000);
            
            // Image slider functionality in Division 2
            const imageSlides = document.querySelectorAll('.slider-images');
            const imageDots = document.querySelectorAll('.slider-dot');
            let currentImageSlide = 0;
            
            function showImageSlide(index) {
                imageSlides.forEach(slide => {
                    slide.classList.remove('active');
                });
                
                imageDots.forEach(dot => {
                    dot.classList.remove('active');
                });
                
                imageSlides[index].classList.add('active');
                imageDots[index].classList.add('active');
                
                currentImageSlide = index;
            }
            
            imageDots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showImageSlide(index);
                });
            });
            
            // Auto-rotate image slides every 4 seconds
            setInterval(() => {
                let nextImageSlide = (currentImageSlide + 1) % imageSlides.length;
                showImageSlide(nextImageSlide);
            }, 4000);
        });
