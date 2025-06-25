import { gsap } from 'gsap';

export const initLoginAnimations = () => {
  // Timeline principal
  const tl = gsap.timeline({
    defaults: {
      ease: 'power3.out',
    }
  });

  // Animação do background e container
  tl.from('.modern-login-container', {
    opacity: 0,
    duration: 1
  })
  .from('.login-card', {
    opacity: 0,
    y: 30,
    duration: 0.8,
  }, '-=0.5')
  .from('.brand-logo', {
    opacity: 0,
    y: -20,
    duration: 0.6,
  }, '-=0.3')
  .from('.login-title, .login-subtitle', {
    opacity: 0,
    y: 20,
    stagger: 0.1,
    duration: 0.6,
  }, '-=0.3')
  .from('.input-container', {
    opacity: 0,
    x: -30,
    stagger: 0.15,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.2')
  .from('.forgot-password', {
    opacity: 0,
    y: 10,
    duration: 0.4,
  }, '-=0.2')
  .from('.login-button', {
    opacity: 0,
    scale: 0.8,
    duration: 0.6,
    ease: 'back.out(1.7)'
  }, '-=0.2')
  .from('.register-section', {
    opacity: 0,
    y: 20,
    duration: 0.6,
  }, '-=0.3');

  // Animações de hover
  gsap.utils.toArray('.login-button, .register-button').forEach((button: any) => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.03,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
};

// Animação de shake melhorada para feedback de erro
export const shakeElement = (element: string) => {
  gsap.to(element, {
    keyframes: [
      { x: 0, duration: 0 },
      { x: -8, duration: 0.1 },
      { x: 8, duration: 0.1 },
      { x: -6, duration: 0.1 },
      { x: 6, duration: 0.1 },
      { x: -4, duration: 0.1 },
      { x: 4, duration: 0.1 },
      { x: 0, duration: 0.1 }
    ],
    ease: 'power2.out'
  });
};

// Animação de loading para o botão de login
export const startLoadingAnimation = (button: string) => {
  const tl = gsap.timeline({ repeat: -1 });
  
  tl.to(button, {
    scale: 0.95,
    duration: 0.4,
    ease: 'power2.inOut'
  })
  .to(button, {
    scale: 1,
    duration: 0.4,
    ease: 'power2.inOut'
  });
  
  return tl;
};

// Animação de transição entre formulários melhorada
export const switchFormAnimation = (hideElement: string, showElement: string) => {
  const tl = gsap.timeline({
    defaults: {
      duration: 0.5,
      ease: 'power2.inOut'
    }
  });
  
  tl.to(hideElement, {
    opacity: 0,
    x: -30,
    filter: 'blur(5px)'
  })
  .set(hideElement, { display: 'none' })
  .set(showElement, { 
    display: 'block',
    x: 30,
    opacity: 0,
    filter: 'blur(5px)'
  })
  .to(showElement, {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)'
  });

  return tl;
}; 