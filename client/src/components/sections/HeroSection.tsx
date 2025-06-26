import React from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import { Link } from 'react-scroll';
import { TypeAnimation } from 'react-type-animation';
// Import with cache busting query parameter
import heroProfileImgSrc from '../../assets/img/hero-profile.png';
import cvPdf from '../../assets/cv/Ruchira_Tharanka_CV.pdf';

const HeroSection: React.FC = () => {
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
              <div className="absolute -bottom-4 -right-4 bg-accent text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
                <TypeAnimation
                  sequence={[
                    // First typing of "Full Stack Developer"
                    "F",
                    10, "Fu",
                    10, "Ful",
                    10, "Full",
                    10, "Full ",
                    10, "Full S",
                    10, "Full St",
                    10, "Full Sta",
                    10, "Full Stac",
                    10, "Full Stack",
                    10, "Full Stack ",
                    10, "Full Stack D",
                    10, "Full Stack De",
                    10, "Full Stack Dev",
                    10, "Full Stack Deve",
                    10, "Full Stack Devel",
                    10, "Full Stack Develo",
                    10, "Full Stack Develop",
                    10, "Full Stack Develope",
                    10, "Full Stack Developer",
                    2000, // Pause before deleting
                    // Backspace effect
                    "Full Stack Develope",
                    10, "Full Stack Develop",
                    10, "Full Stack Develo",
                    10, "Full Stack Devel",
                    10, "Full Stack Deve",
                    10, "Full Stack Dev",
                    10, "Full Stack De",
                    10, "Full Stack D",
                    10, "Full Stack ",
                    10, "Full Stack",
                    10, "Full Stac",
                    10, "Full Sta",
                    10, "Full St",
                    10, "Full S",
                    10, "Full ",
                    10, "Full",
                    10, "Ful",
                    10, "Fu",
                    10, "F",
                    10, "",
                    200, // Small pause before next text
                    // Now type "SE Undergraduate"
                    "S",
                    10, "SE",
                    10, "SE ",
                    10, "SE U",
                    10, "SE Un",
                    10, "SE Und",
                    10, "SE Unde",
                    10, "SE Under",
                    10, "SE Underg",
                    10, "SE Undergr",
                    10, "SE Undergra",
                    10, "SE Undergrad",
                    10, "SE Undergradu",
                    10, "SE Undergradua",
                    10, "SE Undergraduat",
                    10, "SE Undergraduate",
                    2000, // Pause before deleting
                    // Backspace effect for second text
                    "SE Undergraduat",
                    10, "SE Undergradua",
                    10, "SE Undergradu",
                    10, "SE Undergrad",
                    10, "SE Undergra",
                    10, "SE Undergr",
                    10, "SE Underg",
                    10, "SE Under",
                    10, "SE Unde",
                    10, "SE Und",
                    10, "SE Un",
                    10, "SE U",
                    10, "SE ",
                    10, "SE",
                    10, "S",
                    10, "",
                    200, // Small pause before loop restarts
                  ]}
                  wrapper="span"
                  speed={1} // Default speed, individual delays are set in sequence
                  repeat={Infinity} // Loop forever
                  cursor={true}
                />
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