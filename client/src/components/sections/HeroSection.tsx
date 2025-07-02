import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import { Link } from 'react-scroll';
import { TypeAnimation } from 'react-type-animation';
// Import with cache busting query parameter
import heroProfileImgSrc from '../../assets/img/hero-profile.png';
import cvPdf from '../../assets/cv/Ruchira_Tharanka_CV.pdf';

// Helper function to generate typing animation sequence
const generateTypingSequence = (text: string, typingDelay: number = 10, pauseDuration: number = 2000) => {
  const sequence: (string | number)[] = [];
  
  // Generate typing effect (progressively show more letters)
  for (let i = 1; i <= text.length; i++) {
    sequence.push(text.substring(0, i)); // Add the text up to this character
    if (i < text.length) sequence.push(typingDelay); // Add delay except after the last character
  }
  
  // Add pause at the end of complete text
  sequence.push(pauseDuration);
  
  return sequence;
};

// Helper function to generate deletion animation sequence
const generateDeletionSequence = (text: string, deletionDelay: number = 10) => {
  const sequence: (string | number)[] = [];
  
  // Generate deletion effect (progressively remove letters)
  for (let i = text.length - 1; i >= 0; i--) {
    sequence.push(text.substring(0, i)); // Add the text minus the last character
    if (i > 0) sequence.push(deletionDelay); // Add delay except after the last character
  }
  
  return sequence;
};

const HeroSection: React.FC = () => {
  // Generate the complete animation sequence
  const animationSequence = useMemo(() => {
    const text1 = "Full Stack Developer";
    const text2 = "SE Undergraduate";
    const typingDelay = 10;
    const deletionDelay = 10;
    const completePause = 2000;
    const transitionPause = 200;
    
    const sequence: (string | number)[] = [
      // First text - type, pause, then delete
      ...generateTypingSequence(text1, typingDelay, completePause),
      ...generateDeletionSequence(text1, deletionDelay),
      transitionPause,
      
      // Second text - type, pause, then delete
      ...generateTypingSequence(text2, typingDelay, completePause),
      ...generateDeletionSequence(text2, deletionDelay),
      transitionPause,
    ];
    
    return sequence;
  }, []);

  return (
    <section id="hero" className="min-h-screen flex items-center pt-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="section-container relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
          {/* Profile Image */}
          <motion.div
            className="lg:w-5/12 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full overflow-hidden border-4 border-card shadow-xl">
                <img
                  src={`${heroProfileImgSrc}?v=2`} /* Adding version query param to bust cache */
                  alt="Ruchira Tharanka profile image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-4 bg-accent text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg\">
                {/* Add a container with fixed height and direction control */}
                <div className="h-[20px] flex justify-start items-center">
                  <TypeAnimation
                    sequence={animationSequence}
                    wrapper="span"
                    speed={1} // Default speed, individual delays are set in sequence
                    repeat={Infinity} // Loop forever
                    cursor={false}
                    className="block" 
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            className="lg:w-7/12 text-center lg:text-left order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <TypeAnimation
                sequence={[
                  500, // Increased initial delay for visibility
                  "Hi, I'm",
                ]}
                wrapper="span"
                cursor={false}
                repeat={0}
                speed={35} // Slower typing speed
                className="block"
              />
              <TypeAnimation
                sequence={[
                  1400, // Wait until "Hi, I'm" is fully typed
                  "Ruchira Tharanka",
                ]}
                wrapper="span"
                cursor={true} // Show cursor for better effect
                repeat={0}
                speed={30} // Slower typing speed
                className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
              />
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto lg:mx-0">
              Crafting robust, scalable web applications using the modern JavaScript ecosystem.
            </p>

            <div className="flex flex-col items-center sm:flex-row sm:gap-[60px] gap-4 justify-center lg:justify-start">
              <Link
                to="projects"
                spy={true}
                smooth={true}
                offset={-80}
                duration={800}
                className="inline-flex items-center w-fit px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition-colors cursor-pointer shadow-md"
              >
                View My Work
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <a
                href={cvPdf}
                className="inline-flex items-center w-fit px-6 py-3 bg-card hover:bg-card/80 text-foreground font-medium rounded-full border border-border transition-colors shadow-md"
                download="Ruchira_Tharanka_CV.pdf"
                onClick={() => {
                  toast.success('CV Downloading...');
                  // Track download analytics
                  console.log('Resume downloaded');
                }}
              >
                Download CV
                <Download size={18} className="ml-2" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;