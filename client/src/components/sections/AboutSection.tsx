import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AboutSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="about" className=" bg-background relative">
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="section-title">About Me</h2>
          
          <div className="bg-card rounded-xl shadow-lg p-8 md:p-10">
            <div className="space-y-6 text-lg">
              <p>
                I'm a passionate Full Stack Developer with over 5 years of experience building web applications using modern technologies. My journey in software development began during college, where I discovered my love for creating solutions that make people's lives easier.
              </p>
              
              <p>
                I specialize in JavaScript and TypeScript ecosystems, with expertise in React, Node.js, and modern database solutions. I'm passionate about creating performant, accessible, and user-friendly applications that solve real-world problems.
              </p>
              
              <p>
                When I'm not coding, you can find me exploring new hiking trails, reading tech blogs, or experimenting with new technologies. I believe in continuous learning and always strive to improve my skills.
              </p>
              
              <p>
                I'm currently seeking opportunities to work with forward-thinking teams on challenging projects. My goal is to create beautiful, functional web applications that provide excellent user experiences.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;