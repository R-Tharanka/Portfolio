import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AboutSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="about" className="bg-background relative">
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
                Hello! I’m <strong>Ruchira Tharanka</strong>, a Software Engineering undergraduate at SLIIT with a deep passion for full-stack development. I thrive on creating intuitive, user-friendly applications that not only meet functional requirements but also deliver a delightful user experience.
              </p>
              
              <p>
                Over the past few years, I built a strong foundation in HTML, CSS, and JavaScript before working with PHP and Java backends. More recently, I’ve specialized in the MERN stack, completing multiple full-stack projects that leverage MongoDB, React, Node.js, and Express. Along the way, I’ve also worked with relational databases like MySQL and deployed containerized applications on platforms such as Vercel and Render.          
              </p>
              
              <p>
                Beyond coding, I’m an avid learner. I enjoy exploring new project ideas and listening to music while I work. I believe the continuous growth of both personally and professionally, is key to delivering standout software.
              </p>
              
              <p>
                I’m always open to new challenges. If you’re looking for a developer who brings creativity, attention to detail, and a user-centric mindset, let’s connect!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;