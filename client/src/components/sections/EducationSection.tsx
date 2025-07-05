import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, GraduationCap, Loader2 } from 'lucide-react';
import { Education } from '../../types';
import { useApiService } from '../../hooks/useApiService';

const EducationSection: React.FC = () => {
  const { getEducation } = useApiService();
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchEducation = async () => {
      setLoading(true);
      try {
        const response = await getEducation();
        if (response.error) {
          setError(response.error);
          setEducation(response.data); // Fallback data is already included in the response
        } else {
          setEducation(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch education:', err);
        setError('Failed to load education. Using fallback data.');
        setEducation([]); // Empty array if all else fails
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, []);

  return (
    <section id="education" className=" bg-background/50 relative">
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Education & Certificates</h2>
          <p className="section-subtitle">
            My academic background and professional certifications
          </p>
          
          {/* Timeline */}
          <div className="relative mt-12">
            {/* Vertical Line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-primary/20 rounded-full"></div>
            
            {education.length === 0 && !loading && error && (
              <div className="text-center text-foreground/70 py-8">
                <p className="text-xl mb-2">Could Not Load Education</p>
                <p>{error}</p>
              </div>
            )}
            
            {education.length === 0 && !loading && !error && (
              <div className="text-center text-foreground/70 py-8">
                No education data available.
              </div>
            )}
            
            {education.map((item, index) => (
              <motion.div
                key={item.id}
                className={`relative flex flex-col md:flex-row items-center md:items-start mb-12 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 bg-primary rounded-full shadow-lg z-10 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                
                {/* Content */}
                <div className={`md:w-1/2 pl-10 md:pl-0 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                  <div className="bg-card rounded-xl p-6 shadow-md border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="relative left-[-8px] flex-shrink-0 w-6">
                        <GraduationCap size={20} className="text-primary" />
                      </div>
                      <h3 className="text-xl font-bold flex-grow">{item.title}</h3>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-foreground/90 font-medium">{item.institution}</div>
                      <div className="flex items-center text-foreground/60 text-sm mt-1">
                        <Calendar size={14} className="mr-1" />
                        <span>
                          {formatDate(item.timeline.start)} — {item.timeline.end ? formatDate(item.timeline.end) : 'Present'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-foreground/70 mb-4">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {item.skills.map(skill => (
                        <span 
                          key={skill} 
                          className="px-2 py-1 bg-background text-foreground/80 text-xs rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

export default EducationSection;