import React from 'react';
import {
    SiApachetomcat, SiPhp, SiExpress, SiNodedotjs, SiSpringboot,
    SiMongodb, SiMysql, SiCanva, SiFigma, SiAdobeillustrator, SiAdobephotoshop,
    SiVercel, SiRailway, SiTailwindcss, SiJavascript, SiChartdotjs,
    SiC, SiCplusplus, SiSharp, SiKotlin,
    SiPostman, SiWordpress, SiTwilio
} from 'react-icons/si';

import {
    FaGit, FaGithub, FaDocker, FaHtml5, FaCss3Alt, FaReact,
    FaBootstrap, FaJava, FaPython, FaCode
} from 'react-icons/fa';

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    tomcat: SiApachetomcat,
    php: SiPhp,
    express: SiExpress,
    node: SiNodedotjs,
    springboot: SiSpringboot,
    mongodb: SiMongodb,
    mysql: SiMysql,
    canva: SiCanva,
    figma: SiFigma,
    illustrator: SiAdobeillustrator,
    photoshop: SiAdobephotoshop,
    git: FaGit,
    github: FaGithub,
    vercel: SiVercel,
    railway: SiRailway,
    docker: FaDocker,
    html: FaHtml5,
    css: FaCss3Alt,
    react: FaReact,
    tailwind: SiTailwindcss,
    javascript: SiJavascript,
    chartjs: SiChartdotjs,
    bootstrap: FaBootstrap,
    java: FaJava,
    python: FaPython,
    javafx: FaJava,
    c: SiC,
    'c++': SiCplusplus,
    'c#': SiSharp,
    kotlin: SiKotlin,
    postman: SiPostman,
    wordpress: SiWordpress,
    twilio: SiTwilio,
    // Add a default icon
    // default: FaCode 
};
