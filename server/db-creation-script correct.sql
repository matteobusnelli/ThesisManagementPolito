CREATE DATABASE IF NOT EXISTS db_se_thesismanagement;

USE db_se_thesismanagement;

CREATE TABLE IF NOT EXISTS user_type (
    id VARCHAR(4) PRIMARY KEY,
    user_type VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) PRIMARY KEY,
    salt VARCHAR(16) NOT NULL,
    password VARCHAR(128) NOT NULL,
    user_type_id VARCHAR(4) NOT NULL,
    FOREIGN KEY (user_type_id) REFERENCES user_type(id)
);

CREATE TABLE IF NOT EXISTS student (
    id VARCHAR(7) PRIMARY KEY,
    surname VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cod_degree VARCHAR(10) NOT NULL,
    enrollment_year INT NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher (
    id VARCHAR(7) PRIMARY KEY,
    surname VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cod_group VARCHAR(10) NOT NULL,
    cod_department VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS secretary(
    id VARCHAR(7) PRIMARY KEY,
    surname VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS degree_table (
    cod_degree VARCHAR(10) PRIMARY KEY,
    title_degree VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS career (
    id VARCHAR(7) NOT NULL,
    cod_course VARCHAR(10) NOT NULL,
    title_course VARCHAR(50) NOT NULL,
    cfu INT NOT NULL,
    grade DECIMAL(3, 0) NOT NULL,
    date DATE NOT NULL,
    PRIMARY KEY (id, cod_course),
    FOREIGN KEY (id) REFERENCES student(id)
);

CREATE TABLE IF NOT EXISTS group_table(
    cod_group VARCHAR(10) PRIMARY KEY,
    group_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS department(
    cod_department VARCHAR(10) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    cod_group VARCHAR(10) NOT NULL,
    PRIMARY KEY (cod_department, cod_group),
    FOREIGN KEY (cod_group) REFERENCES group_table(cod_group)
);

CREATE TABLE IF NOT EXISTS external_supervisor(
    email VARCHAR(255) PRIMARY KEY,
    surname VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL
);



CREATE TABLE IF NOT EXISTS thesis(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    supervisor_id VARCHAR(7) NOT NULL,
    thesis_level VARCHAR(20) NOT NULL,
    thesis_type VARCHAR(50) NOT NULL,
    required_knowledge TEXT NOT NULL,
    notes TEXT NOT NULL,
    expiration DATETIME NOT NULL,
    cod_degree VARCHAR(10) NOT NULL,
    keywords TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT 0,
    is_expired BOOLEAN NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (cod_degree) REFERENCES degree_table(cod_degree),
    FOREIGN KEY (supervisor_id) REFERENCES teacher(id)
);

CREATE TABLE IF NOT EXISTS thesis_request(
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(7),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    supervisor_id VARCHAR(7) NOT NULL,
    start_date DATETIME ,
    status_code INT NOT NULL DEFAULT 0,
    FOREIGN KEY (supervisor_id) REFERENCES teacher(id),
    FOREIGN KEY (student_id) REFERENCES student(id)
);

CREATE TABLE IF NOT EXISTS thesis_group(
    thesis_id INT NOT NULL,
    group_id VARCHAR(10) NOT NULL,
    PRIMARY KEY (thesis_id, group_id),
    FOREIGN KEY (thesis_id) REFERENCES thesis(id),
    FOREIGN KEY (group_id) REFERENCES group_table(cod_group)
);

CREATE TABLE IF NOT EXISTS thesis_cosupervisor_teacher(
    id INT AUTO_INCREMENT PRIMARY KEY,
    thesis_id INT,
    thesisrequest_id INT,
    cosupevisor_id VARCHAR(7) NOT NULL,
    FOREIGN KEY (thesis_id) REFERENCES thesis(id),
    FOREIGN KEY (cosupevisor_id) REFERENCES teacher(id),
    FOREIGN KEY (thesisrequest_id) REFERENCES thesis_request(id)
);

CREATE TABLE IF NOT EXISTS thesis_cosupervisor_external(
    id INT AUTO_INCREMENT PRIMARY KEY,
    thesis_id INT,
    thesisrequest_id INT,
    cosupevisor_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (thesis_id) REFERENCES thesis(id),
    FOREIGN KEY (cosupevisor_id) REFERENCES external_supervisor(email),
    FOREIGN KEY (thesisrequest_id) REFERENCES thesis_request(id)
);

CREATE TABLE IF NOT EXISTS application(
    student_id VARCHAR(7) NOT NULL,
    thesis_id INT NOT NULL,
    status VARCHAR(10) NOT NULL,
    application_date DATETIME NOT NULL,
    PRIMARY KEY (student_id, thesis_id),
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (thesis_id) REFERENCES thesis(id)
);

INSERT INTO user_type (id, user_type)
VALUES
    ('PROF', 'Professor'),
    ('COSP', 'Co-supervisor'),
    ('STUD', 'Student'),
    ('SECR', 'Secretary clerk'),
    ('FADI', 'Faculty director'),
    ('PCOM', 'President of commission');
INSERT INTO users (email, salt, password, user_type_id)
VALUES  
    ('juan.stefano.pauli@polito.it', 'djfhdkfkdiccjfnd', '11e645a4aba1bafaba5e0ee6f4d3e5ebf744955e5f7a1ee55f5e4fe1973adff8d8b28aab85e3701848c310b60448216e40e173b35e1a904e5501567bd39bb936', 'PROF'),
    ('giulia.saracco@polito.it', 'ofkgmdkcmdjmdjcj', 'e1c8b98e21034791c5211bf024ac7da3f5ffa1863924da7debdf6e528aff641c226d180cfa1fcbf3ca2c3348891a976d8d797d6402c36cfc60db5394f962d4bb', 'PROF'),
    ('elmo.moss@studenti.polito.it', 'ghnhngsfddfrfrfr', '02895538f17ffe15681c0e47b4453d2b461bc917b2ec450621363f4446d19eb2a589842a4c5885e92795a4e80b3295c966af188b8f49e0fdb29b88dbcb8e0679', 'STUD'),
    ('bryan.woods@studenti.polito.it', 'ofmdjdivlkmdfvnv', '8acbaf864d280f282d1ea5dc2c4c8b469b4e7abbf1679435e3736321f3b05c90a0d14f0c106b9b92ba5e7512a88465800b6e04408918a46b8b3450d0f344f7e1', 'STUD'),
    ('giuseppe.verdi@studenti.polito.it', 'ofmdjdivlkmdfvnv', '8acbaf864d280f282d1ea5dc2c4c8b469b4e7abbf1679435e3736321f3b05c90a0d14f0c106b9b92ba5e7512a88465800b6e04408918a46b8b3450d0f344f7e1', 'STUD'),
    ('davide.costa@studenti.polito.it', 'ofmdjdivlkmdfvnv', '8acbaf864d280f282d1ea5dc2c4c8b469b4e7abbf1679435e3736321f3b05c90a0d14f0c106b9b92ba5e7512a88465800b6e04408918a46b8b3450d0f344f7e1', 'STUD'),
    ('martina.spiaggia@studenti.polito.it', 'ofmdjdivlkmdfvnv', '8acbaf864d280f282d1ea5dc2c4c8b469b4e7abbf1679435e3736321f3b05c90a0d14f0c106b9b92ba5e7512a88465800b6e04408918a46b8b3450d0f344f7e1', 'STUD'),
    ('marco.bianchi@studenti.polito.it', 'ofmdjdivlkmdfvnv', '8acbaf864d280f282d1ea5dc2c4c8b469b4e7abbf1679435e3736321f3b05c90a0d14f0c106b9b92ba5e7512a88465800b6e04408918a46b8b3450d0f344f7e1', 'STUD'),
    ('pam.beesly@polito.it', 'ofmdjdivlkmdfvnv', '8acbaf864d280f282d1ea5dc2c4c8b469b4e7abbf1679435e3736321f3b05c90a0d14f0c106b9b92ba5e7512a88465800b6e04408918a46b8b3450d0f344f7e1', 'SECR');
INSERT INTO student (id, surname, name, gender, nationality, email, cod_degree, enrollment_year) 
VALUES
    ('S123456', 'Moss', 'Elmo', 'Male', 'Italian', 'elmo.moss@studenti.polito.it', 'DEGR01', 2020),
    ('S654321', 'Woods', 'Bryan', 'male', 'American', 'bryan.woods@studenti.polito.it', 'DEGR01', 2018),
    ('S444444', 'Spiaggia', 'Martina', 'Female', 'Italian', 'davide.costa@studenti.polito.it', 'DEGR01', 2018),
    ('S333333', 'Costa', 'Davide', 'Male', 'Italian', 'davide.costa@studenti.polito.it', 'DEGR01', 2018),
    ('S222222', 'Verdi', 'Giuseppe', 'Male', 'Italian', 'giuseppe.verdi@studenti.polito.it', 'DEGR01', 2018),
    ('S111111', 'Bianchi', 'Marco', 'Male', 'Italian', 'marco.bianchi@studenti.polito.it', 'DEGR01', 2023);
INSERT INTO teacher (id, surname, name, email, cod_group, cod_department) 
VALUES
    ('P123456', 'Pauli', 'Juan Stefano', 'juan.stefano.pauli@polito.it', 'GRP02', 'DEP02'),
    ('P654321', 'Saracco', 'Giulia', 'giulia.saracco@polito.it', 'GRP03', 'DEP03');
INSERT INTO secretary (id, surname, name, email) 
VALUES
    ('E123456', 'Beesly', 'Pam', 'pam.beesly@polito.it');
INSERT INTO degree_table (cod_degree, title_degree) 
VALUES
    ('DEGR01', 'Computer engineering Master Degree'),
    ('DEGR02', 'Electronic engineering Master Degree'),
    ('DEGR03', 'Electrical engineering Master Degree'),
    ('DEGR04', 'Data science Master Degree'),
    ('DEGR05', 'Mechanical engineering Master Degree');
INSERT INTO career (id, cod_course, title_course, cfu,grade, date) 
VALUES
    ('S123456','COU01','Software Engineering 2' ,6,18, '2023-01-15'),
    ('S123456','COU02', 'Sicurezza dei sistemi informativi' ,12,24, '2022-02-20'),
    ('S123456','COU03','Cloud computing' ,12,30, '2023-04-15'),
    ('S123456','COU04', 'Computational intelligence' ,12,30, '2021-02-20'),
    ('S123456','COU05','Programmazione di sistema' ,8,30, '2023-01-15'),
    ('S123456','COU06', 'Applicazioni web' ,12,28, '2023-09-23'),
    ('S123456','COU07','Applicazioni web 2' ,6,30, '2023-01-15'),
    ('S123456','COU08', 'Mobile application' ,12,26, '2023-06-12'),
    ('S654321','COU01','Data science',9,30, '2023-01-15'),
    ('S654321','COU02', 'Software Engineering 1',9,27, '2023-02-20'),
    ('S654321','COU03','Cloud computing' ,12,30, '2023-04-15'),
    ('S654321','COU04', 'Computational intelligence' ,12,30, '2021-02-20'),
    ('S654321','COU05','Programmazione di sistema' ,8,28, '2023-01-15'),
    ('S654321','COU06', 'Applicazioni web' ,12,29, '2023-09-23'),
    ('S654321','COU07','Applicazioni web 2' ,6,30, '2023-01-15'),
    ('S654321','COU08', 'Mobile application' ,12,30, '2023-06-21'),
    ('S111111','COU01','Data science',9,30, '2023-01-15'),
    ('S111111','COU02', 'Software Engineering 1',9,27, '2023-02-20'),
    ('S111111','COU03','Cloud computing' ,12,30, '2023-04-15'),
    ('S111111','COU04', 'Computational intelligence' ,12,30, '2021-02-20'),
    ('S111111','COU05','Programmazione di sistema' ,8,28, '2023-01-15'),
    ('S111111','COU06', 'Applicazioni web' ,12,29, '2023-09-23'),
    ('S111111','COU07','Applicazioni web 2' ,6,30, '2023-01-15'),
    ('S111111','COU08', 'Mobile application' ,12,30, '2023-06-12'),
    ('S222222','COU01','Data science',9,30, '2023-01-15'),
    ('S222222','COU02', 'Software Engineering 1',9,27, '2023-02-20'),
    ('S222222','COU03','Cloud computing' ,12,30, '2023-04-15'),
    ('S222222','COU04', 'Computational intelligence' ,12,30, '2021-02-20'),
    ('S222222','COU05','Programmazione di sistema' ,8,28, '2023-01-15'),
    ('S222222','COU06', 'Applicazioni web' ,12,29, '2023-09-23'),
    ('S222222','COU07','Applicazioni web 2' ,6,30, '2023-01-15'),
    ('S222222','COU08', 'Mobile application' ,12,30, '2023-06-12'),
    ('S333333','COU01','Data science',9,30, '2023-01-15'),
    ('S333333','COU02', 'Software Engineering 1',9,27, '2023-02-20'),
    ('S333333','COU03','Cloud computing' ,12,30, '2023-04-15'),
    ('S333333','COU04', 'Computational intelligence' ,12,30, '2021-02-20'),
    ('S333333','COU05','Programmazione di sistema' ,8,28, '2023-01-15'),
    ('S333333','COU06', 'Applicazioni web' ,12,29, '2023-09-23'),
    ('S333333','COU07','Applicazioni web 2' ,6,30, '2023-01-15'),
    ('S333333','COU08', 'Mobile application' ,12,30, '2023-06-12'),
    ('S444444','COU01','Data science',9,30, '2023-01-15'),
    ('S444444','COU02', 'Software Engineering 1',9,27, '2023-02-20'),
    ('S444444','COU03','Cloud computing' ,12,30, '2023-04-15'),
    ('S444444','COU04', 'Computational intelligence' ,12,30, '2021-02-20'),
    ('S444444','COU05','Programmazione di sistema' ,8,28, '2023-01-15'),
    ('S444444','COU06', 'Applicazioni web' ,12,29, '2023-09-23'),
    ('S444444','COU07','Applicazioni web 2' ,6,30, '2023-01-15'),
    ('S444444','COU08', 'Mobile application' ,12,30, '2023-06-12');
    
INSERT INTO group_table (cod_group, group_name)
VALUES
    ('GRP01', 'Computer group'),
    ('GRP02', 'Electronic group'),
    ('GRP03', 'Applied Science group');
INSERT INTO department (cod_department, department_name, cod_group) 
    VALUES
    ('DEP01', 'Computer department', 'GRP01'),
    ('DEP02', 'Electronics department', 'GRP02'),
    ('DEP03', 'Applied Science department', 'GRP03');
INSERT INTO external_supervisor (email, surname, name) 
    VALUES
    ('andrea.ferrari@email.com', 'Ferrari', 'Andrea'),
    ('maria.gentile@email.net', 'Gentile', 'Maria'),
    ('antonio.bruno@email.org', 'Bruno', 'Antonio'),
    ('elena.conti@email.net', 'Conti', 'Elena');
INSERT INTO thesis (title, description, supervisor_id, thesis_level, thesis_type, required_knowledge, notes, expiration, cod_degree, keywords, is_archived, is_expired)
VALUES
    ('Development of a Secure Web Application', 'The thesis, "Development of a Secure Web Application," focuses on creating a robust and safeguarded online platform. Delving into the evolving landscape of cyber threats, the research explores cutting-edge security measures for web application development. The study encompasses a thorough analysis of prevalent threats, secure coding practices, and encryption protocols. Key elements include the integration of authentication mechanisms and continuous monitoring to fortify the application against unauthorized access and data breaches. The development phase emphasizes the selection of secure technologies and programming languages to build a resilient foundation. The thesis also addresses user authentication, authorization, and the implementation of multi-factor authentication for heightened security. Continuous testing, automated security tools, and prompt application of security updates contribute to the proactive defense against emerging threats. Real-world testing scenarios validate the efficacy of the developed secure web application, assessing its performance under various conditions. The research serves as a practical guide for developers, businesses, and organizations aiming to prioritize security in the web development process. By combining theoretical insights with tested implementations, this thesis contributes to the ongoing efforts to create web applications that not only meet functional requirements but also adhere to the highest standards of security.', 'P123456', 'Master', 'Sperimental', 'Strong knowledge of web security and programming.', 'Enhances web security practices. Includes multi-factor authentication and continuous monitoring. Suitable for developers and organizations prioritizing security in web development.', '2024-12-15 23:59:59', 'DEGR01','AUTOMATION, HUMAN COMPUTER INTERACTION',0,0),
    ('IoT-Based Smart Home Automation', 'The thesis, IoT-Based Smart Home Automation, explores the integration of the Internet of Things (IoT) in home technology, aiming to enhance efficiency and convenience. It delves into the theoretical foundations and practical implementation of IoT devices, examining protocols, sensors, and communication technologies. The research focuses on creating interconnected systems for seamless control of home devices, incorporating sensors for environment monitoring and automated responses. Security, privacy, and data management within the IoT ecosystem are addressed, with real-world case studies validating the system efficacy. The thesis anticipates future trends, offering a concise guide for researchers and developers in creating intelligent, secure, and scalable smart home solutions.', 'P123456', 'Master', 'Company', 'Experience with IoT protocols and devices.', 'Must be completed within 6 months.', '2024-08-30 23:59:59', 'DEGR01','USER EXPERIENCE, AUTOMATION, MACHINE LEARNING', 0,0),
    ('Network Traffic Analysis', 'The thesis, "Network Traffic Analysis," delves into the examination and understanding of data flows within computer networks. Focused on enhancing cybersecurity, the research explores techniques for monitoring, capturing, and analyzing network traffic patterns. It investigates the identification of anomalous behavior, potential security threats, and the optimization of network performance. The study encompasses the utilization of advanced tools, protocols, and methodologies to extract meaningful insights from the vast volume of data traversing networks. Practical applications include intrusion detection, network optimization, and overall improvement in the security posture of interconnected systems. This thesis serves as a valuable resource for cybersecurity professionals, network administrators, and researchers seeking to bolster network resilience and preemptively address emerging threats.', 'P123456', 'Master', 'Sperimental', 'Background in network security and data analysis.', 'Enhances network security practices. Suitable for cybersecurity professionals and network administrators.', '2024-07-30 23:59:59', 'DEGR01','NETWORK, IP, MAC',0,0),
    ('Healthcare Data Analytics', 'The thesis, "Healthcare Data Analytics," delves into the transformative impact of data analytics in the healthcare domain. Investigating both theoretical foundations and practical applications, the research explores how advanced analytics techniques can extract valuable insights from vast and complex healthcare datasets. Key aspects include the utilization of data mining, machine learning algorithms, and statistical analysis to uncover patterns, trends, and correlations within medical data. The study addresses the challenges of handling diverse healthcare data sources, ensuring data privacy, and maintaining compliance with regulatory standards. Real-world applications encompass predictive analytics for disease diagnosis, patient outcome forecasting, and resource optimization within healthcare systems. The thesis highlights the potential for data analytics to enhance clinical decision-making, improve patient outcomes, and streamline healthcare operations. This comprehensive guide serves as a valuable resource for healthcare professionals, researchers, and data scientists seeking to harness the power of data analytics to drive innovation and improvements in the healthcare industry.', 'P654321', 'Master', 'Company', 'Proficiency in data analytics and understanding of healthcare systems.', 'The thesis must comply with privacy regulations.', '2023-12-01 23:59:59', 'DEGR01', 'DATA ANALYTICS, HEALTHCARE, PRIVACY', 0,1),
    ('Mobile App Development for Health Monitoring', 'The thesis, "Mobile App Development for Health Monitoring," focuses on creating a user-friendly and feature-rich mobile application for monitoring and maintaining personal health. Exploring the intersection of mobile technology and healthcare, the research covers the design and implementation of intuitive interfaces, integration with health sensors, and real-time data visualization. Key elements include user engagement strategies, data security measures, and compatibility with various mobile devices. The study addresses the challenges of collecting and processing health data, offering practical solutions for enhancing user well-being. This thesis is a valuable resource for developers, healthcare professionals, and individuals seeking innovative ways to leverage mobile technology for health monitoring.', 'P123456', 'Master', 'Sperimental', 'Mobile app development and basic knowledge of health monitoring.', 'Focuses on user-friendly health monitoring apps. Suitable for developers and healthcare professionals.', '2024-09-15 23:59:59', 'DEGR01', 'MOBILE APP, HEALTH MONITORING, USER INTERFACE', 0, 0),
    ('Artificial Intelligence in Financial Forecasting', 'The thesis, "Artificial Intelligence in Financial Forecasting," explores the application of AI algorithms for predicting financial trends and market movements. Delving into the realm of finance and technology, the research investigates machine learning models, data analytics, and algorithmic trading strategies. Key aspects include feature engineering, model training, and evaluating the accuracy of financial predictions. The study addresses challenges such as data volatility and market uncertainties, offering insights into building robust and adaptive forecasting models. Real-world applications include investment decision support and risk management. This thesis serves as a practical guide for finance professionals, analysts, and researchers seeking to harness the power of AI in making informed financial decisions.', 'P654321', 'Master', 'Company', 'Understanding of financial markets and proficiency in programming.', 'Must be completed within 8 months. Offers insights into AI applications in finance.', '2024-11-30 23:59:59', 'DEGR01', 'ARTIFICIAL INTELLIGENCE, FINANCIAL FORECASTING, MACHINE LEARNING', 0, 0),
    ('Augmented Reality for Education', 'The thesis, "Augmented Reality for Education," explores the integration of augmented reality (AR) technology to enhance learning experiences. Investigating the synergy between education and immersive technologies, the research covers AR app development, content creation, and pedagogical applications. Key elements include interactive learning modules, virtual simulations, and user engagement strategies. The study addresses challenges in AR adoption within educational settings, providing practical solutions for educators and developers. Real-world applications include AR-enhanced textbooks, virtual field trips, and interactive educational content. This thesis is a valuable resource for educators, developers, and researchers interested in leveraging AR to revolutionize the educational landscape.', 'P123456', 'Master', 'Sperimental', 'Familiarity with augmented reality technology and educational practices.', 'Explores AR applications in education. Suitable for educators and developers.', '2024-05-31 23:59:59', 'DEGR01', 'AUGMENTED REALITY, EDUCATION, IMMERSIVE TECHNOLOGY', 0, 0),
    ('Cyber-Physical Systems for Smart Cities', 'The thesis, "Cyber-Physical Systems for Smart Cities," delves into the integration of advanced technologies to enhance urban infrastructure and services. Investigating the convergence of cyber and physical elements, the research explores the development of intelligent systems for efficient city management. Key aspects include sensor networks, data analytics, and adaptive control mechanisms. The study addresses challenges in urban planning and sustainability, offering insights into creating resilient and interconnected city systems. Real-world applications include smart transportation, energy management, and public safety. This thesis serves as a comprehensive guide for urban planners, engineers, and policymakers aiming to create smarter and more sustainable cities.', 'P654321', 'Master', 'Company', 'Understanding of smart city concepts and proficiency in system design.', 'Must address real-world urban challenges. Explores the integration of cyber and physical elements.', '2024-10-15 23:59:59', 'DEGR01', 'CYBER-PHYSICAL SYSTEMS, SMART CITIES, URBAN PLANNING', 0, 0),
    ('E-commerce Platform Optimization', 'The thesis, "E-commerce Platform Optimization," focuses on enhancing the performance and user experience of online shopping platforms. Investigating the intersection of e-commerce and technology, the research covers website optimization, database management, and user interface enhancements. Key elements include load balancing, caching strategies, and responsive design. The study addresses challenges in e-commerce scalability and customer satisfaction, providing practical solutions for platform optimization. Real-world applications include faster page load times, streamlined checkout processes, and improved search functionality. This thesis serves as a practical guide for e-commerce developers, business owners, and tech enthusiasts seeking to optimize online shopping experiences.', 'P123456', 'Master', 'Sperimental', 'Experience with e-commerce platforms and web development.', 'Optimizes e-commerce platforms for enhanced performance. Suitable for developers and business owners.', '2025-04-30 23:59:59', 'DEGR01', 'E-COMMERCE, OPTIMIZATION, USER EXPERIENCE', 0, 0),
    ('Natural Language Processing for Sentiment Analysis', 'The thesis, "Natural Language Processing for Sentiment Analysis," explores the application of NLP techniques in analyzing textual data for sentiment identification. Investigating the intersection of language and machine learning, the research covers NLP algorithms, text preprocessing, and sentiment classification models. Key aspects include the training of models on large text corpora and evaluating their performance in sentiment prediction. The study addresses challenges in language nuances and context-dependent sentiment, providing insights into building accurate sentiment analysis systems. Real-world applications include social media monitoring, customer feedback analysis, and market sentiment tracking. This thesis serves as a valuable resource for linguists, data scientists, and developers interested in leveraging NLP for sentiment analysis.', 'P654321', 'Master', 'Abroad', 'Proficiency in natural language processing and machine learning.', 'Must be completed within 7 months. Explores NLP applications in sentiment analysis.', '2023-07-31 23:59:59', 'DEGR01', 'NATURAL LANGUAGE PROCESSING, SENTIMENT ANALYSIS, MACHINE LEARNING', 0, 1);
INSERT INTO thesis_group (thesis_id, group_id)
VALUES
    (1, 'GRP01'),
    (2, 'GRP01'),
    (3, 'GRP01'),
    (4, 'GRP01'),
    (5, 'GRP01'),
    (6, 'GRP01'),
    (7, 'GRP01'),
    (8, 'GRP01'),
    (9, 'GRP01'),
    (10, 'GRP01');

INSERT INTO application (student_id, thesis_id, status, application_date)
VALUES
    ('S123456', 1, 'Rejected', '2023-12-15 10:30:00'),
    ('S123456', 2, 'Cancelled', '2023-11-20 14:45:00'),
    ('S654321', 4, 'Rejected', '2023-03-12 09:00:00'),
    ('S123456', 5, 'Rejected', '2023-07-10 11:30:00'),
    ('S654321', 6, 'Cancelled', '2023-02-28 13:15:00'),
    ('S222222', 1,  'pending','2024-01-10 13:15:00'),
    ('S333333', 2,  'pending','2024-01-10 13:15:00')
;

INSERT INTO thesis_cosupervisor_external (thesis_id, cosupevisor_id)
VALUES 
    (3, 'maria.gentile@email.net'),
    (3, 'antonio.bruno@email.org'),
    (6, 'andrea.ferrari@email.com');

INSERT INTO thesis_request (student_id, title, description, supervisor_id, start_date, status_code)
VALUES
    ('S111111', 'Ethical Considerations in Autonomous Vehicles', 'Investigating ethics in autonomous vehicles, focusing on decision algorithms, safety, and societal impacts for developing ethical guidelines.', 'P654321', '2023-04-11 10:58:00', 0),
    ('S222222', 'The Integration of Blockchain in Supply Chain Management', 'This thesis explores the integration of blockchain technology in supply chain management.', 'P123456', '2023-06-10 18:18:00', 1),
    ('S333333', 'Impact of Social Media on Political Discourse', 'This thesis examines the impact of social media on political discourse. The study analyzes how social media platforms influence public opinion. The goal is to gain insights into the evolving dynamics of political communication in the digital age.', 'P123456', '2023-06-10 18:18:00', 0),
    ('S444444', 'Cybersecurity Measures in Smart Cities', 'This thesis investigates cybersecurity measures in smart cities. The study focuses on assessing vulnerabilities in interconnected systems, proposing strategies to mitigate cyber threats.', 'P123456', '2023-06-10 18:18:00', 1);

INSERT INTO thesis_cosupervisor_teacher (thesis_id, thesisrequest_id ,cosupevisor_id)
VALUES 
	(NULL, 1, 'P123456'),
    (NULL, 2, 'P654321'),
    (NULL, 3, 'P654321');